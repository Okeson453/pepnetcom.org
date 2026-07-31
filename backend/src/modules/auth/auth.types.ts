import type { User, Session } from '@prisma/client'

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface AuthResult {
  user: SafeUser
  tokens: AuthTokens
}

export interface TokenPayload {
  userId: string
  email: string
  role: string
}

export type SafeUser = Omit<User, 'passwordHash' | 'twoFactorSecret' | 'twoFactorBackupCodes'>
