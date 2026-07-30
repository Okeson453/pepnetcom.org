import { describe, it, expect, beforeEach, vi } from 'vitest'
import { hash } from 'bcryptjs'
import { createHmac } from 'crypto'
import { AuthService } from '../src/modules/auth/auth.service'
import { AuthRepository } from '../src/modules/auth/auth.repository'
import { UnauthorizedError, ValidationError, NotFoundError } from '../src/shared/errors/domain-error'
import { generateBase32Secret, verifyTotpCode } from '../src/shared/crypto/totp'

// auth.service.ts talks to the redis singleton directly (not injected), so
// the 2FA setup/confirm flow (which stashes the in-progress secret in redis
// for a few minutes) needs the module mocked rather than a real connection —
// this suite otherwise has no live Redis or Postgres available.
vi.mock('../src/shared/cache/redis-client', () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  },
}))
import { redis } from '../src/shared/cache/redis-client'

const basePasswordHash = await hash('correct-password', 12)

const mockRepo = {
  findUserByEmail: vi.fn(),
  findUserById: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  createSession: vi.fn(),
  deleteSession: vi.fn(),
  findSessionByRefreshToken: vi.fn(),
} as unknown as AuthRepository

describe('AuthService — 2FA', () => {
  const service = new AuthService(mockRepo)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('startTwoFactorSetup', () => {
    it('returns not found for a missing user', async () => {
      mockRepo.findUserById = vi.fn().mockResolvedValue(null)
      const result = await service.startTwoFactorSetup('missing', 'a@b.com')
      expect(result.success).toBe(false)
      expect(result.error).toBeInstanceOf(NotFoundError)
    })

    it('generates a secret, caches it in redis with a TTL, and does not enable 2FA yet', async () => {
      mockRepo.findUserById = vi.fn().mockResolvedValue({ id: 'u1' })
      const result = await service.startTwoFactorSetup('u1', 'user@example.com')
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.secret).toMatch(/^[A-Z2-7]+$/)
        expect(result.data.otpAuthUri).toContain('user%40example.com')
      }
      expect(redis.set).toHaveBeenCalledWith('auth:2fa-setup:u1', expect.any(String), 'EX', 600)
      expect(mockRepo.updateUser).not.toHaveBeenCalled()
    })
  })

  describe('confirmTwoFactorSetup', () => {
    it('rejects when no setup is in progress (redis key expired or missing)', async () => {
      vi.mocked(redis.get).mockResolvedValue(null)
      const result = await service.confirmTwoFactorSetup('u1', '123456')
      expect(result.success).toBe(false)
      expect(result.error).toBeInstanceOf(ValidationError)
      expect(mockRepo.updateUser).not.toHaveBeenCalled()
    })

    it('rejects an invalid TOTP code without enabling 2FA', async () => {
      const secret = generateBase32Secret()
      vi.mocked(redis.get).mockResolvedValue(secret)
      const result = await service.confirmTwoFactorSetup('u1', '000000')
      // Astronomically unlikely to collide with the real code; if it ever
      // does, verifyTotpCode itself would also treat it as valid — not a
      // false failure of this test.
      expect(result.success).toBe(false)
      expect(mockRepo.updateUser).not.toHaveBeenCalled()
    })

    it('enables 2FA, stores the secret, and returns plaintext backup codes on a valid code', async () => {
      const secret = generateBase32Secret()
      vi.mocked(redis.get).mockResolvedValue(secret)

      // Derive a code guaranteed to pass verifyTotpCode right now, computed
      // the same way the authenticator app would (see currentCodeFor below).
      const code = currentCodeFor(secret)
      expect(verifyTotpCode(secret, code)).toBe(true)

      const result = await service.confirmTwoFactorSetup('u1', code)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.backupCodes).toHaveLength(10)
      }
      expect(mockRepo.updateUser).toHaveBeenCalledWith(
        'u1',
        expect.objectContaining({ twoFactorEnabled: true, twoFactorSecret: secret }),
      )
      expect(redis.del).toHaveBeenCalledWith('auth:2fa-setup:u1')
    })
  })

  describe('disableTwoFactor', () => {
    it('returns not found for a missing user', async () => {
      mockRepo.findUserById = vi.fn().mockResolvedValue(null)
      const result = await service.disableTwoFactor('missing', 'password')
      expect(result.success).toBe(false)
      expect(result.error).toBeInstanceOf(NotFoundError)
    })

    it('rejects an incorrect password and leaves 2FA untouched', async () => {
      const passwordHash = await hash('correct-password', 12)
      mockRepo.findUserById = vi.fn().mockResolvedValue({ id: 'u1', passwordHash })
      const result = await service.disableTwoFactor('u1', 'wrong-password')
      expect(result.success).toBe(false)
      expect(result.error).toBeInstanceOf(UnauthorizedError)
      expect(mockRepo.updateUser).not.toHaveBeenCalled()
    })

    it('clears 2FA fields on a correct password', async () => {
      const passwordHash = await hash('correct-password', 12)
      mockRepo.findUserById = vi.fn().mockResolvedValue({ id: 'u1', passwordHash })
      const result = await service.disableTwoFactor('u1', 'correct-password')
      expect(result.success).toBe(true)
      expect(mockRepo.updateUser).toHaveBeenCalledWith('u1', {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: [],
      })
    })
  })

  describe('login — 2FA gate', () => {
    it('signals MFA_REQUIRED (without leaking that as a distinct error type) when no code is supplied', async () => {
      mockRepo.findUserByEmail = vi.fn().mockResolvedValue({
        id: 'u1',
        email: 'user@example.com',
        passwordHash: basePasswordHash,
        status: 'ACTIVE',
        role: 'CLIENT',
        twoFactorEnabled: true,
      })
      const result = await service.login({ email: 'user@example.com', password: 'correct-password' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toBe('MFA_REQUIRED')
      }
    })

    it('rejects an invalid TOTP code and backup code', async () => {
      mockRepo.findUserByEmail = vi.fn().mockResolvedValue({
        id: 'u1',
        email: 'user@example.com',
        passwordHash: basePasswordHash,
        status: 'ACTIVE',
        role: 'CLIENT',
        twoFactorEnabled: true,
        twoFactorSecret: generateBase32Secret(),
        twoFactorBackupCodes: [],
      })
      const result = await service.login({
        email: 'user@example.com',
        password: 'correct-password',
        totpCode: '000000',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toBe('Invalid two-factor code')
      }
    })

    it('logs in successfully with a valid TOTP code', async () => {
      const secret = generateBase32Secret()
      mockRepo.findUserByEmail = vi.fn().mockResolvedValue({
        id: 'u1',
        email: 'user@example.com',
        passwordHash: basePasswordHash,
        status: 'ACTIVE',
        role: 'CLIENT',
        twoFactorEnabled: true,
        twoFactorSecret: secret,
        twoFactorBackupCodes: [],
      })
      const code = currentCodeFor(secret)
      const result = await service.login({
        email: 'user@example.com',
        password: 'correct-password',
        totpCode: code,
      })
      expect(result.success).toBe(true)
      expect(mockRepo.createSession).toHaveBeenCalled()
    })

    it('consumes a matching backup code exactly once', async () => {
      const plainBackupCode = 'ABCD-1234'
      const hashedBackupCode = await hash(plainBackupCode, 10)
      mockRepo.findUserByEmail = vi.fn().mockResolvedValue({
        id: 'u1',
        email: 'user@example.com',
        passwordHash: basePasswordHash,
        status: 'ACTIVE',
        role: 'CLIENT',
        twoFactorEnabled: true,
        twoFactorSecret: generateBase32Secret(),
        twoFactorBackupCodes: [hashedBackupCode],
      })
      const result = await service.login({
        email: 'user@example.com',
        password: 'correct-password',
        totpCode: plainBackupCode,
      })
      expect(result.success).toBe(true)
      // The consumed code must be removed from the stored list.
      expect(mockRepo.updateUser).toHaveBeenCalledWith(
        'u1',
        expect.objectContaining({ twoFactorBackupCodes: [] }),
      )
    })
  })
})

/**
 * Same HOTP/TOTP computation as src/shared/crypto/totp.ts's internals, used
 * only to derive a code that's guaranteed to verify *right now* for a given
 * secret, without depending on that module exporting its private `hotp`
 * helper. Kept minimal — the actual correctness assertions on the algorithm
 * live in totp.test.ts.
 */
function currentCodeFor(base32Secret: string): string {
  const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  const clean = base32Secret.toUpperCase().replace(/[^A-Z2-7]/g, '')
  let bits = ''
  for (const char of clean) {
    const val = BASE32_ALPHABET.indexOf(char)
    if (val === -1) continue
    bits += val.toString(2).padStart(5, '0')
  }
  const bytes: number[] = []
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2))
  }
  const secretBuf = Buffer.from(bytes)
  const counter = Math.floor(Date.now() / 1000 / 30)
  const counterBuf = Buffer.alloc(8)
  counterBuf.writeUInt32BE(counter, 4)
  const hmac = createHmac('sha1', secretBuf).update(counterBuf).digest()
  const offset = hmac[hmac.length - 1] & 0x0f
  const binCode =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)
  return String(binCode % 1_000_000).padStart(6, '0')
}
