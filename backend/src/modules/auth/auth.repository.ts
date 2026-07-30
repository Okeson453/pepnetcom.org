import { prisma } from '../../shared/db/prisma-client'
import { usersRepository } from '../users/users.repository'
import type { User, Session } from '@prisma/client'

/**
 * Auth-specific data access. Basic user CRUD (find/create/update) is
 * intentionally NOT duplicated here — it delegates to usersRepository,
 * the single source of truth for the User model. This repository only
 * owns what's unique to the auth module: session lifecycle, plus the
 * auth-specific defaults applied at registration time.
 */
export class AuthRepository {
  async findUserByEmail(email: string): Promise<User | null> {
    return usersRepository.findByEmail(email)
  }

  async findUserById(id: string): Promise<User | null> {
    return usersRepository.findById(id)
  }

  async createUser(data: {
    email: string
    passwordHash: string
    firstName: string
    lastName: string
    phone?: string
    role: string
  }): Promise<User> {
    return usersRepository.create({
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: data.role as any,
      status: 'PENDING_VERIFICATION',
    })
  }

  /**
   * Google-authenticated signup: status is ACTIVE and emailVerified is true
   * immediately (Google already verified the email address on their end —
   * making the user verify it again with us would be redundant), and
   * passwordHash is a random value the user can never type in, since this
   * account can only ever sign in via Google unless a "set a password" flow
   * is added later. Role is always CLIENT — Google sign-in is a
   * self-registration path, same restriction as the regular register().
   */
  async createGoogleUser(data: {
    email: string
    passwordHash: string
    firstName: string
    lastName: string
    avatarUrl?: string
  }): Promise<User> {
    return usersRepository.create({
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      avatarUrl: data.avatarUrl,
      role: 'CLIENT' as any,
      status: 'ACTIVE',
      emailVerified: true,
    })
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return usersRepository.update(id, data as any)
  }

  async createSession(data: {
    userId: string
    token: string
    refreshToken: string
    expiresAt: Date
    userAgent?: string
    ipAddress?: string
  }): Promise<Session> {
    return prisma.session.create({ data })
  }

  async findSessionByToken(token: string): Promise<Session | null> {
    return prisma.session.findUnique({ where: { token } })
  }

  async findSessionByRefreshToken(refreshToken: string): Promise<Session | null> {
    return prisma.session.findUnique({ where: { refreshToken } })
  }

  async deleteSession(token: string): Promise<void> {
    await prisma.session.deleteMany({ where: { token } })
  }

  async deleteUserSessions(userId: string, exceptToken?: string): Promise<void> {
    await prisma.session.deleteMany({
      where: { userId, ...(exceptToken ? { token: { not: exceptToken } } : {}) },
    })
  }
}

export const authRepository = new AuthRepository()
