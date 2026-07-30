// Runs before tests/setup.ts (see vitest.config.ts's setupFiles order) so
// that `env.ts`'s zod validation — triggered the moment anything imports
// the Prisma/Redis clients — has real values to parse instead of throwing.
// Bun's native test runner (`bun test`) loads .env.test automatically;
// vitest does not, so this file does it manually for that path.
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const envPath = resolve(__dirname, '../.env.test')
if (existsSync(envPath)) {
  const contents = readFileSync(envPath, 'utf-8')
  for (const line of contents.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim()
    if (!(key in process.env)) process.env[key] = value
  }
}
