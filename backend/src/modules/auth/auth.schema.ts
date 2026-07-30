import { z } from 'zod'
import { UserRole } from '@prisma/client'

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().optional(),
  role: z.nativeEnum(UserRole).default('CLIENT'),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  /** Required only when the account has 2FA enabled — see authService.login(). Accepts either a 6-digit TOTP code or a backup code (e.g. "7F3K-9QRT"). */
  totpCode: z.string().optional(),
})

export const twoFactorVerifySetupSchema = z.object({
  code: z.string().min(6).max(9),
})

export const twoFactorDisableSchema = z.object({
  password: z.string(),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

export const resendVerificationSchema = z.object({
  email: z.string().email(),
})

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8).max(100),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(100),
})

export const verifyEmailSchema = z.object({
  token: z.string(),
})

export const refreshTokenSchema = z.object({
  refreshToken: z.string(),
})

export const googleAuthSchema = z.object({
  // A Google-issued ID token (JWT) from Google Identity Services' "Sign in
  // with Google" button on the frontend — verified server-side against
  // Google's JWKS before we ever trust its claims. See google-auth.ts.
  idToken: z.string().min(1),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type TwoFactorVerifySetupInput = z.infer<typeof twoFactorVerifySetupSchema>
export type TwoFactorDisableInput = z.infer<typeof twoFactorDisableSchema>
