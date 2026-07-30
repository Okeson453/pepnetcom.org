import { settingsRepository } from './settings.repository'
import { Ok, Err } from '../../shared/result'
import { NotFoundError } from '../../shared/errors/domain-error'
import type { Result } from '../../shared/result'
import type { ApiKey } from '@prisma/client'
import { createHash, randomBytes } from 'crypto'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { s3Adapter } from '../../integrations/storage/s3.adapter'
import { env } from '../../config/env'
import { logger } from '../../shared/logging/logger'

const execFileAsync = promisify(execFile)

export class SettingsService {
  constructor(private repo = settingsRepository) {}

  async getSettings(category: string): Promise<Record<string, any>> {
    const settings = await this.repo.findByCategory(category)
    return settings.reduce((acc, s) => {
      acc[s.key] = s.value
      return acc
    }, {} as Record<string, any>)
  }

  async updateSettings(category: string, data: Record<string, any>): Promise<void> {
    await this.repo.upsertMany(category, data)
  }

  async listApiKeys(): Promise<ApiKey[]> {
    return this.repo.findApiKeys()
  }

  async createApiKey(userId: string, input: any): Promise<{ apiKey: ApiKey; plainKey: string }> {
    const plainKey = `pk_${randomBytes(32).toString('hex')}`
    const keyHash = createHash('sha256').update(plainKey).digest('hex')
    const apiKey = await this.repo.createApiKey({
      userId,
      name: input.name,
      keyHash,
      scopes: input.scopes,
      expiresAt: input.expiresAt,
    })
    return { apiKey, plainKey }
  }

  async revokeApiKey(id: string): Promise<Result<ApiKey, NotFoundError>> {
    const key = await this.repo.findApiKeyById(id)
    if (!key) {
      return Err(new NotFoundError('API Key', id))
    }
    const updated = await this.repo.deactivateApiKey(id)
    return Ok(updated)
  }

  /**
   * Runs a real `pg_dump` and uploads the result to storage. This is safe to
   * implement for real — it's additive and read-only against the database.
   *
   * Requires the `pg_dump` binary to be present in the runtime image (same
   * major version as the Postgres server, ideally) and DATABASE_URL to be
   * reachable from wherever this process runs.
   */
  async triggerBackup(): Promise<{ success: boolean; message: string; storageKey?: string }> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const storageKey = `backups/manual-${timestamp}.dump`
    try {
      // Never pass DATABASE_URL (which embeds the password) as a bare CLI
      // argument — argv is readable by anything that can see /proc/<pid>/cmdline
      // or run `ps aux` on the host. Parse it and hand pg_dump the pieces via
      // environment variables instead, which pg_dump's libpq reads natively
      // and which aren't visible in the process list.
      const url = new URL(env.DATABASE_URL)
      const pgEnv = {
        ...process.env,
        PGHOST: url.hostname,
        PGPORT: url.port || '5432',
        PGUSER: decodeURIComponent(url.username),
        PGPASSWORD: decodeURIComponent(url.password),
        PGDATABASE: url.pathname.replace(/^\//, ''),
      }
      const { stdout } = await execFileAsync(
        'pg_dump',
        ['--format=custom', '--no-owner', '--no-privileges'],
        { maxBuffer: 1024 * 1024 * 1024, encoding: 'buffer' as const, env: pgEnv },
      )
      await s3Adapter.upload(stdout, storageKey, 'application/octet-stream')
      logger.info('Manual backup completed', { storageKey, sizeBytes: stdout.length })
      return { success: true, message: 'Backup completed', storageKey }
    } catch (err) {
      logger.error('Manual backup failed', { error: (err as Error).message })
      return { success: false, message: `Backup failed: ${(err as Error).message}` }
    }
  }

  /**
   * Deliberately NOT implemented as an app-level destructive action. A `pg_restore`
   * triggered through an app endpoint — with no additional confirmation UI, no
   * dry-run, no point-in-time target — is exactly the kind of "one click, no
   * undo" operation that shouldn't exist here. Use your Postgres provider's own
   * restore/PITR mechanism (e.g. Railway's Postgres plugin, or `pg_restore`
   * run manually by an operator against the dump from triggerBackup()) instead.
   * This returns an honest "not available" response rather than a fake success.
   */
  async restoreBackup(): Promise<{ success: boolean; message: string }> {
    return {
      success: false,
      message:
        'Restore is not performed through the app. Use your Postgres provider\'s backup/PITR restore, or run `pg_restore` manually against a backup from POST /settings/backup.',
    }
  }
}

export const settingsService = new SettingsService()
