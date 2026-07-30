import { hash, compare } from 'bcryptjs'
import { SignJWT, jwtVerify, decodeJwt } from 'jose'
import { randomUUID, randomBytes } from 'crypto'
import { env } from '../../config/env'
import { authRepository } from './auth.repository'
import { verifyGoogleIdToken } from './google-auth'
import { redis } from '../../shared/cache/redis-client'
import { resendAdapter as emailPort } from '../../integrations/email/resend.adapter'
import { verifyTotpCode, generateBase32Secret, buildOtpAuthUri, generateBackupCodes } from '../../shared/crypto/totp'
import { Ok, Err } from '../../shared/result'
import { UnauthorizedError, ConflictError, NotFoundError, ValidationError } from '../../shared/errors/domain-error'
import type { Result } from '../../shared/result'
import type { RegisterInput, LoginInput, ForgotPasswordInput, ResetPasswordInput, VerifyEmailInput, RefreshTokenInput, ChangePasswordInput } from './auth.schema'
import type { AuthResult, SafeUser, TokenPayload } from './auth.types'
import type { User } from '@prisma/client'

const JWT_SECRET = new TextEncoder().encode(env.JWT_SECRET)
const JWT_REFRESH_SECRET = new TextEncoder().encode(env.JWT_REFRESH_SECRET)
const ACCESS_TOKEN_EXPIRY = '15m'
const REFRESH_TOKEN_EXPIRY = '7d'
const PASSWORD_RESET_TTL_SECONDS = 30 * 60
const EMAIL_VERIFY_TTL_SECONDS = 24 * 60 * 60

function passwordResetKey(token: string): string {
  return `auth:reset-token:${token}`
}

function emailVerifyKey(token: string): string {
  return `auth:verify-token:${token}`
}

async function sendVerificationEmail(userId: string, email: string): Promise<void> {
  const token = randomBytes(32).toString('hex')
  await redis.set(emailVerifyKey(token), userId, 'EX', EMAIL_VERIFY_TTL_SECONDS)
  const verifyUrl = `${env.FRONTEND_URL}/verify-email?token=${token}`
  await emailPort.send(
    email,
    'Verify your email',
    `Please verify your email address. This link expires in 24 hours: ${verifyUrl}`,
  )
}

function omitPassword(user: User): SafeUser {
  const { passwordHash: _, twoFactorSecret: __, twoFactorBackupCodes: ___, ...safe } = user
  return safe
}

function revocationKey(jti: string): string {
  return `auth:revoked-jti:${jti}`
}

async function createAccessToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setJti(randomUUID())
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(JWT_SECRET)
}

async function createRefreshToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(JWT_REFRESH_SECRET)
}

/**
 * Revoke a still-unexpired access token immediately (used on logout), instead
 * of only relying on its own 15-minute expiry. Stores the token's `jti` in a
 * Redis set with a TTL matching its remaining lifetime, so the set never
 * grows unbounded and expires itself right when the token would have anyway.
 */
async function revokeAccessToken(token: string): Promise<void> {
  try {
    const payload = decodeJwt(token)
    if (!payload.jti || !payload.exp) return
    const ttlSeconds = payload.exp - Math.floor(Date.now() / 1000)
    if (ttlSeconds <= 0) return
    await redis.set(revocationKey(payload.jti), '1', 'EX', ttlSeconds)
  } catch {
    // Malformed token — nothing to revoke.
  }
}

export async function verifyToken(token: string): Promise<Result<SafeUser, UnauthorizedError>> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, { clockTolerance: 60 })
    if (payload.jti) {
      const revoked = await redis.exists(revocationKey(payload.jti as string))
      if (revoked) {
        return Err(new UnauthorizedError('Token has been revoked'))
      }
    }
    const user = await authRepository.findUserById(payload.userId as string)
    if (!user || user.status !== 'ACTIVE') {
      return Err(new UnauthorizedError('Invalid or expired token'))
    }
    return Ok(omitPassword(user))
  } catch {
    return Err(new UnauthorizedError('Invalid or expired token'))
  }
}

export async function verifyRefreshToken(token: string): Promise<Result<TokenPayload, UnauthorizedError>> {
  try {
    const { payload } = await jwtVerify(token, JWT_REFRESH_SECRET, { clockTolerance: 60 })
    return Ok({
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as string,
    })
  } catch {
    return Err(new UnauthorizedError('Invalid or expired refresh token'))
  }
}

export class AuthService {
  constructor(private repo = authRepository) {}

  async register(input: RegisterInput): Promise<Result<AuthResult, ConflictError | ValidationError>> {
    const existing = await this.repo.findUserByEmail(input.email)
    if (existing) {
      return Err(new ConflictError('An account with this email already exists'))
    }

    if (input.role === 'ADMIN') {
      return Err(new ValidationError('Cannot self-register as admin'))
    }

    const passwordHash = await hash(input.password, 12)
    const user = await this.repo.createUser({
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      role: input.role,
    })

    await sendVerificationEmail(user.id, user.email)

    const safeUser = omitPassword(user)
    const payload: TokenPayload = { userId: user.id, email: user.email, role: user.role }
    const [accessToken, refreshToken] = await Promise.all([
      createAccessToken(payload),
      createRefreshToken(payload),
    ])

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await this.repo.createSession({
      userId: user.id,
      token: accessToken,
      refreshToken,
      expiresAt,
    })

    return Ok({
      user: safeUser,
      tokens: { accessToken, refreshToken, expiresIn: 900 },
    })
  }

  async login(input: LoginInput): Promise<Result<AuthResult, UnauthorizedError>> {
    const user = await this.repo.findUserByEmail(input.email)
    if (!user) {
      return Err(new UnauthorizedError('Invalid email or password'))
    }

    if (user.status === 'SUSPENDED') {
      return Err(new UnauthorizedError('Account suspended'))
    }

    if (user.status === 'PENDING_VERIFICATION') {
      return Err(new UnauthorizedError('Please verify your email before logging in'))
    }

    const valid = await compare(input.password, user.passwordHash)
    if (!valid) {
      return Err(new UnauthorizedError('Invalid email or password'))
    }

    if (user.twoFactorEnabled) {
      if (!input.totpCode) {
        // Distinct, deliberately non-descriptive-of-cause message the
        // frontend checks for verbatim to know to show a code-entry step
        // rather than a generic "login failed" error — see
        // features/auth/hooks/use-auth.ts and the login page.
        return Err(new UnauthorizedError('MFA_REQUIRED'))
      }
      const validCode = await this.verifyLoginTwoFactorCode(user, input.totpCode)
      if (!validCode) {
        return Err(new UnauthorizedError('Invalid two-factor code'))
      }
    }

    const safeUser = omitPassword(user)
    const payload: TokenPayload = { userId: user.id, email: user.email, role: user.role }
    const [accessToken, refreshToken] = await Promise.all([
      createAccessToken(payload),
      createRefreshToken(payload),
    ])

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await this.repo.createSession({
      userId: user.id,
      token: accessToken,
      refreshToken,
      expiresAt,
    })

    return Ok({
      user: safeUser,
      tokens: { accessToken, refreshToken, expiresIn: 900 },
    })
  }

  /**
   * Checks a login-time code against either the TOTP secret or the backup
   * codes, consuming (and persisting removal of) a backup code if that's
   * what matched. Backup codes are single-use by design.
   */
  private async verifyLoginTwoFactorCode(user: User, code: string): Promise<boolean> {
    if (user.twoFactorSecret && verifyTotpCode(user.twoFactorSecret, code)) {
      return true
    }
    const normalized = code.trim().toUpperCase()
    for (const hashedCode of user.twoFactorBackupCodes) {
      if (await compare(normalized, hashedCode)) {
        await this.repo.updateUser(user.id, {
          twoFactorBackupCodes: user.twoFactorBackupCodes.filter((c: string) => c !== hashedCode),
        })
        return true
      }
    }
    return false
  }

  /**
   * Step 1 of enabling 2FA: generates a secret and backup codes but does
   * NOT persist or enable anything yet — that only happens once
   * confirmTwoFactorSetup() verifies the user actually has the secret
   * loaded into an authenticator app (see the frontend flow this pairs
   * with), so a user can't get locked into a broken setup. The secret is
   * cached in Redis, keyed to the user, for the few minutes setup takes.
   */
  async startTwoFactorSetup(userId: string, email: string): Promise<Result<{ secret: string; otpAuthUri: string }, NotFoundError>> {
    const user = await this.repo.findUserById(userId)
    if (!user) return Err(new NotFoundError('User'))

    const secret = generateBase32Secret()
    await redis.set(`auth:2fa-setup:${userId}`, secret, 'EX', 600)
    return Ok({ secret, otpAuthUri: buildOtpAuthUri(secret, email) })
  }

  /** Step 2: confirms the user's authenticator produces a matching code, then actually turns 2FA on and issues backup codes (returned once, in plaintext — they're stored hashed). */
  async confirmTwoFactorSetup(userId: string, code: string): Promise<Result<{ backupCodes: string[] }, ValidationError>> {
    const secret = await redis.get(`auth:2fa-setup:${userId}`)
    if (!secret) {
      return Err(new ValidationError('No 2FA setup in progress, or it expired — please restart setup'))
    }
    if (!verifyTotpCode(secret, code)) {
      return Err(new ValidationError('Invalid code — check your authenticator app and try again'))
    }

    const backupCodes = generateBackupCodes()
    const hashedCodes = await Promise.all(backupCodes.map((c) => hash(c, 10)))
    await this.repo.updateUser(userId, {
      twoFactorEnabled: true,
      twoFactorSecret: secret,
      twoFactorBackupCodes: hashedCodes,
    })
    await redis.del(`auth:2fa-setup:${userId}`)
    return Ok({ backupCodes })
  }

  /** Requires re-entering the password (not just an authed session) since this removes a security control — same reasoning as changePassword requiring the current password. */
  async disableTwoFactor(userId: string, password: string): Promise<Result<void, UnauthorizedError | NotFoundError>> {
    const user = await this.repo.findUserById(userId)
    if (!user) return Err(new NotFoundError('User'))
    const valid = await compare(password, user.passwordHash)
    if (!valid) return Err(new UnauthorizedError('Incorrect password'))

    await this.repo.updateUser(userId, {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: [],
    })
    return Ok(undefined)
  }

  async logout(token: string): Promise<Result<void, never>> {
    await Promise.all([this.repo.deleteSession(token), revokeAccessToken(token)])
    return Ok(undefined)
  }

  async loginWithGoogle(idToken: string): Promise<Result<AuthResult, UnauthorizedError>> {
    const profile = await verifyGoogleIdToken(idToken)
    if (!profile) {
      return Err(new UnauthorizedError('Invalid Google sign-in'))
    }
    if (!profile.emailVerified) {
      return Err(new UnauthorizedError('Google account email is not verified'))
    }

    let user = await this.repo.findUserByEmail(profile.email)

    if (user && user.status === 'SUSPENDED') {
      return Err(new UnauthorizedError('Account suspended'))
    }

    if (!user) {
      // A random, never-typeable password hash — see createGoogleUser's doc
      // comment. 32 bytes of randomness hashed the same as a real password,
      // so there is nothing weaker about this account's stored credential,
      // it's simply one nobody (including the user) will ever enter.
      const unusablePassword = await hash(randomBytes(32).toString('hex'), 12)
      user = await this.repo.createGoogleUser({
        email: profile.email,
        passwordHash: unusablePassword,
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatarUrl: profile.picture,
      })
    }

    const safeUser = omitPassword(user)
    const payload: TokenPayload = { userId: user.id, email: user.email, role: user.role }
    const [accessToken, refreshToken] = await Promise.all([
      createAccessToken(payload),
      createRefreshToken(payload),
    ])

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await this.repo.createSession({
      userId: user.id,
      token: accessToken,
      refreshToken,
      expiresAt,
    })

    return Ok({
      user: safeUser,
      tokens: { accessToken, refreshToken, expiresIn: 900 },
    })
  }

  async forgotPassword(input: ForgotPasswordInput): Promise<Result<void, never>> {
    // Always return Ok regardless of whether the account exists, to prevent email enumeration.
    const user = await this.repo.findUserByEmail(input.email)
    if (user) {
      const token = randomBytes(32).toString('hex')
      await redis.set(passwordResetKey(token), user.id, 'EX', PASSWORD_RESET_TTL_SECONDS)
      const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`
      await emailPort.send(
        user.email,
        'Reset your password',
        `We received a request to reset your password. This link expires in 30 minutes: ${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.`,
      )
    }
    return Ok(undefined)
  }

  async resetPassword(input: ResetPasswordInput): Promise<Result<void, ValidationError>> {
    const userId = await redis.get(passwordResetKey(input.token))
    if (!userId) {
      return Err(new ValidationError('Invalid or expired reset token'))
    }
    const passwordHash = await hash(input.password, 12)
    await this.repo.updateUser(userId, { passwordHash })
    await redis.del(passwordResetKey(input.token))
    // Changing the password invalidates every existing session — force re-login everywhere.
    await this.repo.deleteUserSessions(userId)
    return Ok(undefined)
  }

  /**
   * Authenticated password change — the user already has a session and
   * proves they still control the account by supplying the CURRENT
   * password, unlike resetPassword() above which proves control via a
   * emailed one-time token instead. Also invalidates every other session
   * the same way resetPassword does, since a changed password should log
   * out any other device that might have been compromised.
   */
  async changePassword(
    userId: string,
    input: ChangePasswordInput,
    currentSessionToken: string,
  ): Promise<Result<void, UnauthorizedError | ValidationError>> {
    const user = await this.repo.findUserById(userId)
    if (!user) {
      return Err(new UnauthorizedError('Invalid session'))
    }

    const valid = await compare(input.currentPassword, user.passwordHash)
    if (!valid) {
      return Err(new ValidationError('Current password is incorrect'))
    }

    const passwordHash = await hash(input.newPassword, 12)
    await this.repo.updateUser(userId, { passwordHash })

    // Invalidate every OTHER session (revoke-all-but-this-one) so a
    // password change actually locks out anyone using a stolen session,
    // while not immediately signing the user themselves out mid-request.
    await this.repo.deleteUserSessions(userId, currentSessionToken)

    return Ok(undefined)
  }

  async verifyEmail(input: VerifyEmailInput): Promise<Result<void, ValidationError>> {
    const userId = await redis.get(emailVerifyKey(input.token))
    if (!userId) {
      return Err(new ValidationError('Invalid or expired verification token'))
    }
    await this.repo.updateUser(userId, { emailVerified: true })
    await redis.del(emailVerifyKey(input.token))
    return Ok(undefined)
  }

  async resendVerification(email: string): Promise<Result<void, never>> {
    const user = await this.repo.findUserByEmail(email)
    if (user && !user.emailVerified) {
      await sendVerificationEmail(user.id, user.email)
    }
    return Ok(undefined)
  }

  async refreshToken(input: RefreshTokenInput): Promise<Result<AuthResult, UnauthorizedError>> {
    const refreshResult = await verifyRefreshToken(input.refreshToken)
    if (!refreshResult.success) {
      return Err(refreshResult.error)
    }

    const session = await this.repo.findSessionByRefreshToken(input.refreshToken)
    if (!session || session.expiresAt < new Date()) {
      return Err(new UnauthorizedError('Invalid or expired session'))
    }

    const user = await this.repo.findUserById(refreshResult.data.userId)
    if (!user || user.status !== 'ACTIVE') {
      return Err(new UnauthorizedError('User not found or inactive'))
    }

    const safeUser = omitPassword(user)
    const payload: TokenPayload = { userId: user.id, email: user.email, role: user.role }
    const [accessToken, newRefreshToken] = await Promise.all([
      createAccessToken(payload),
      createRefreshToken(payload),
    ])

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await this.repo.createSession({
      userId: user.id,
      token: accessToken,
      refreshToken: newRefreshToken,
      expiresAt,
    })

    // Delete old session
    await this.repo.deleteSession(session.token)

    return Ok({
      user: safeUser,
      tokens: { accessToken, refreshToken: newRefreshToken, expiresIn: 900 },
    })
  }

  async me(userId: string): Promise<Result<SafeUser, NotFoundError>> {
    const user = await this.repo.findUserById(userId)
    if (!user) {
      return Err(new NotFoundError('User'))
    }
    return Ok(omitPassword(user))
  }
}

export const authService = new AuthService()
