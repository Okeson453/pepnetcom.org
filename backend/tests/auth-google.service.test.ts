import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AuthService } from '../src/modules/auth/auth.service'
import { AuthRepository } from '../src/modules/auth/auth.repository'
import { UnauthorizedError } from '../src/shared/errors/domain-error'

vi.mock('../src/modules/auth/google-auth', () => ({
  verifyGoogleIdToken: vi.fn(),
}))
import { verifyGoogleIdToken } from '../src/modules/auth/google-auth'

const mockRepo = {
  findUserByEmail: vi.fn(),
  findUserById: vi.fn(),
  createUser: vi.fn(),
  createGoogleUser: vi.fn(),
  updateUser: vi.fn(),
  createSession: vi.fn(),
  deleteSession: vi.fn(),
  findSessionByRefreshToken: vi.fn(),
} as unknown as AuthRepository

describe('AuthService — Google OAuth login', () => {
  const service = new AuthService(mockRepo)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects an ID token that fails verification (bad signature, wrong audience, etc.)', async () => {
    vi.mocked(verifyGoogleIdToken).mockResolvedValue(null)
    const result = await service.loginWithGoogle('bad-token')
    expect(result.success).toBe(false)
    expect(result.error).toBeInstanceOf(UnauthorizedError)
    expect(mockRepo.createGoogleUser).not.toHaveBeenCalled()
  })

  it('rejects a Google account whose email Google itself has not verified', async () => {
    vi.mocked(verifyGoogleIdToken).mockResolvedValue({
      sub: 'g-1',
      email: 'a@b.com',
      emailVerified: false,
      firstName: 'A',
      lastName: 'B',
    })
    const result = await service.loginWithGoogle('token')
    expect(result.success).toBe(false)
    expect(mockRepo.createGoogleUser).not.toHaveBeenCalled()
  })

  it('rejects a suspended existing account', async () => {
    vi.mocked(verifyGoogleIdToken).mockResolvedValue({
      sub: 'g-1',
      email: 'suspended@example.com',
      emailVerified: true,
      firstName: 'A',
      lastName: 'B',
    })
    mockRepo.findUserByEmail = vi.fn().mockResolvedValue({ id: 'u1', status: 'SUSPENDED' })
    const result = await service.loginWithGoogle('token')
    expect(result.success).toBe(false)
    expect(result.error).toBeInstanceOf(UnauthorizedError)
  })

  it('creates a new ACTIVE, email-verified, CLIENT-role user on first Google sign-in', async () => {
    vi.mocked(verifyGoogleIdToken).mockResolvedValue({
      sub: 'g-1',
      email: 'first-time@example.com',
      emailVerified: true,
      firstName: 'First',
      lastName: 'Time',
      picture: 'https://example.com/avatar.png',
    })
    mockRepo.findUserByEmail = vi.fn().mockResolvedValue(null)
    mockRepo.createGoogleUser = vi.fn().mockResolvedValue({
      id: 'u1',
      email: 'first-time@example.com',
      firstName: 'First',
      lastName: 'Time',
      role: 'CLIENT',
      status: 'ACTIVE',
      emailVerified: true,
      avatarUrl: 'https://example.com/avatar.png',
    })

    const result = await service.loginWithGoogle('token')
    expect(result.success).toBe(true)
    expect(mockRepo.createGoogleUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'first-time@example.com',
        firstName: 'First',
        lastName: 'Time',
        avatarUrl: 'https://example.com/avatar.png',
      }),
    )
    expect(mockRepo.createSession).toHaveBeenCalled()
  })

  it('logs in an existing Google-linked user without creating a duplicate account', async () => {
    vi.mocked(verifyGoogleIdToken).mockResolvedValue({
      sub: 'g-1',
      email: 'returning@example.com',
      emailVerified: true,
      firstName: 'Returning',
      lastName: 'User',
    })
    mockRepo.findUserByEmail = vi.fn().mockResolvedValue({
      id: 'u1',
      email: 'returning@example.com',
      firstName: 'Returning',
      lastName: 'User',
      role: 'CLIENT',
      status: 'ACTIVE',
      emailVerified: true,
    })

    const result = await service.loginWithGoogle('token')
    expect(result.success).toBe(true)
    expect(mockRepo.createGoogleUser).not.toHaveBeenCalled()
    expect(mockRepo.createSession).toHaveBeenCalled()
  })
})
