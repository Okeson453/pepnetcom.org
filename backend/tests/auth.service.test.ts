import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AuthService } from '../src/modules/auth/auth.service'
import { AuthRepository } from '../src/modules/auth/auth.repository'
import { ConflictError, UnauthorizedError } from '../src/shared/errors/domain-error'

const mockRepo = {
  findUserByEmail: vi.fn(),
  findUserById: vi.fn(),
  createUser: vi.fn(),
  createSession: vi.fn(),
  deleteSession: vi.fn(),
  findSessionByRefreshToken: vi.fn(),
} as unknown as AuthRepository

describe('AuthService', () => {
  const service = new AuthService(mockRepo)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('register returns conflict when email exists', async () => {
    mockRepo.findUserByEmail = vi.fn().mockResolvedValue({ id: '1', email: 'test@test.com' })
    const result = await service.register({
      email: 'test@test.com',
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User',
      role: 'CLIENT',
    })
    expect(result.success).toBe(false)
    expect(result.error).toBeInstanceOf(ConflictError)
  })

  it('login returns unauthorized for wrong password', async () => {
    mockRepo.findUserByEmail = vi.fn().mockResolvedValue({
      id: '1',
      email: 'test@test.com',
      passwordHash: '$2a$12$hashed',
      status: 'ACTIVE',
      role: 'CLIENT',
    })
    const result = await service.login({ email: 'test@test.com', password: 'wrong' })
    expect(result.success).toBe(false)
    expect(result.error).toBeInstanceOf(UnauthorizedError)
  })

  it('me returns not found for missing user', async () => {
    mockRepo.findUserById = vi.fn().mockResolvedValue(null)
    const result = await service.me('nonexistent')
    expect(result.success).toBe(false)
    expect(result.error.message).toContain('not found')
  })
})
