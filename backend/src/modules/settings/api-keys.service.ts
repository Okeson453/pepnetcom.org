import { settingsRepository } from './settings.repository'
import { Ok, Err } from '../../shared/result'
import { NotFoundError } from '../../shared/errors/domain-error'
import type { Result } from '../../shared/result'
import type { ApiKey } from '@prisma/client'
import { createHash, randomBytes } from 'crypto'

export class ApiKeysService {
  constructor(private repo = settingsRepository) {}

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
}

export const apiKeysService = new ApiKeysService()
