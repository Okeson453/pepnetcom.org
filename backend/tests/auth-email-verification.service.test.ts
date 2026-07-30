import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AuthService } from '../src/modules/auth/auth.service'
import { AuthRepository } from '../src/modules/auth/auth.repository'
import { ValidationError } from '../src/shared/errors/domain-error'

vi.mock('../src/shared/cache/redis-client', () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  },
}))
import { redis } from '../src/shared/cache/redis-client'

vi.mock('../src/integrations/email/resend.adapter', () => ({
  resendAdapter: { send: vi.fn().mockResolvedValue({ success: true }) },
}))
import { resendAdapter } from '../src/integrations/email/resend.adapter'

const mockRepo = {
  findUserByEmail: vi.fn(),
  findUserById: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  createSession: vi.fn(),
  deleteSession: vi.fn(),
  findSessionByRefreshToken: vi.fn(),
} as unknown as AuthRepository

describe('AuthService — registration & email verification', () => {
  const service = new AuthService(mockRepo)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('register', () => {
    it('creates the user with PENDING_VERIFICATION status (via the repository) and sends a verification email', async () => {
      mockRepo.findUserByEmail = vi.fn().mockResolvedValue(null)
      mockRepo.createUser = vi.fn().mockResolvedValue({
        id: 'u1',
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
        role: 'CLIENT',
        status: 'PENDING_VERIFICATION',
        emailVerified: false,
      })

      const result = await service.register({
        email: 'new@example.com',
        password: 'Password123!',
        firstName: 'New',
        lastName: 'User',
        role: 'CLIENT',
      })

      expect(result.success).toBe(true)
      // register() itself doesn't set status — that's AuthRepository.createUser's
      // job (see auth.repository.ts hardcoding PENDING_VERIFICATION) — so this
      // asserts register reads back and returns whatever the repo created,
      // and separately that it kicked off the verification email send.
      if (result.success) {
        expect(result.data.user.status).toBe('PENDING_VERIFICATION')
      }
      expect(resendAdapter.send).toHaveBeenCalledTimes(1)
      const [to, subject] = vi.mocked(resendAdapter.send).mock.calls[0]
      expect(to).toBe('new@example.com')
      expect(subject.toLowerCase()).toContain('verify')
      // The verification token is cached in redis with a 24h TTL, keyed by
      // a random token (not the user id) — confirm the shape without
      // asserting the exact random value.
      expect(redis.set).toHaveBeenCalledWith(
        expect.stringMatching(/^auth:verify-token:/),
        'u1',
        'EX',
        24 * 60 * 60,
      )
    })

    it('rejects a duplicate email without sending an email', async () => {
      mockRepo.findUserByEmail = vi.fn().mockResolvedValue({ id: 'existing' })
      const result = await service.register({
        email: 'taken@example.com',
        password: 'Password123!',
        firstName: 'A',
        lastName: 'B',
        role: 'CLIENT',
      })
      expect(result.success).toBe(false)
      expect(resendAdapter.send).not.toHaveBeenCalled()
      expect(mockRepo.createUser).not.toHaveBeenCalled()
    })

    it('rejects self-registration as ADMIN', async () => {
      mockRepo.findUserByEmail = vi.fn().mockResolvedValue(null)
      const result = await service.register({
        email: 'wannabe-admin@example.com',
        password: 'Password123!',
        firstName: 'A',
        lastName: 'B',
        role: 'ADMIN',
      })
      expect(result.success).toBe(false)
      expect(result.error).toBeInstanceOf(ValidationError)
      expect(mockRepo.createUser).not.toHaveBeenCalled()
    })
  })

  describe('login gate for unverified accounts', () => {
    it('rejects login for a PENDING_VERIFICATION account even with the correct password', async () => {
      mockRepo.findUserByEmail = vi.fn().mockResolvedValue({
        id: 'u1',
        email: 'new@example.com',
        // Real bcrypt hash unnecessary here — status is checked before password compare.
        passwordHash: '$2a$12$abcdefghijklmnopqrstuv',
        status: 'PENDING_VERIFICATION',
        role: 'CLIENT',
      })
      const result = await service.login({ email: 'new@example.com', password: 'whatever' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.message).toContain('verify your email')
      }
    })
  })

  describe('verifyEmail', () => {
    it('rejects an invalid or expired token', async () => {
      vi.mocked(redis.get).mockResolvedValue(null)
      const result = await service.verifyEmail({ token: 'bad-token' })
      expect(result.success).toBe(false)
      expect(result.error).toBeInstanceOf(ValidationError)
      expect(mockRepo.updateUser).not.toHaveBeenCalled()
    })

    it('marks the user emailVerified and consumes the token on a valid one', async () => {
      vi.mocked(redis.get).mockResolvedValue('u1')
      const result = await service.verifyEmail({ token: 'good-token' })
      expect(result.success).toBe(true)
      expect(mockRepo.updateUser).toHaveBeenCalledWith('u1', { emailVerified: true })
      expect(redis.del).toHaveBeenCalledWith('auth:verify-token:good-token')
    })
  })

  describe('resendVerification', () => {
    it('sends a new verification email for an existing unverified user', async () => {
      mockRepo.findUserByEmail = vi.fn().mockResolvedValue({ id: 'u1', email: 'a@b.com', emailVerified: false })
      await service.resendVerification('a@b.com')
      expect(resendAdapter.send).toHaveBeenCalledTimes(1)
    })

    it('does not send an email for an already-verified user', async () => {
      mockRepo.findUserByEmail = vi.fn().mockResolvedValue({ id: 'u1', email: 'a@b.com', emailVerified: true })
      await service.resendVerification('a@b.com')
      expect(resendAdapter.send).not.toHaveBeenCalled()
    })

    it('does not leak account existence for an unknown email (no error, no email sent)', async () => {
      mockRepo.findUserByEmail = vi.fn().mockResolvedValue(null)
      const result = await service.resendVerification('nobody@example.com')
      expect(result.success).toBe(true)
      expect(resendAdapter.send).not.toHaveBeenCalled()
    })
  })
})
