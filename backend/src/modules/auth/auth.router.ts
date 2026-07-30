import { router, publicProcedure, authedProcedure } from '../../trpc/trpc'
import { authService } from './auth.service'
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  refreshTokenSchema,
  resendVerificationSchema,
  googleAuthSchema,
  changePasswordSchema,
  twoFactorVerifySetupSchema,
  twoFactorDisableSchema,
} from './auth.schema'
import { TRPCError } from '@trpc/server'
import { rateLimit } from '../../shared/rate-limit/rate-limiter'

export const authRouter = router({
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ input, ctx }) => {
      // Per-IP only (no account exists yet to key on) — bounds mass account creation.
      await rateLimit({ key: `ratelimit:register:${ctx.ip}`, limit: 10, windowSeconds: 3600 })
      const result = await authService.register(input)
      if (!result.success) {
        throw new TRPCError({ code: 'CONFLICT', message: result.error.message })
      }
      return result.data
    }),

  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({ input }) => {
      await rateLimit({ key: `ratelimit:login:${input.email.toLowerCase()}`, limit: 5, windowSeconds: 300 })
      const result = await authService.login(input)
      if (!result.success) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: result.error.message })
      }
      return result.data
    }),

  googleLogin: publicProcedure
    .input(googleAuthSchema)
    .mutation(async ({ input, ctx }) => {
      // Keyed on IP rather than email — we don't know the email until the
      // token is verified, and this is the same pre-auth abuse surface as
      // regular login/register (someone hammering the endpoint with junk
      // tokens), so it gets the same protection.
      await rateLimit({ key: `ratelimit:google-login:${ctx.ip}`, limit: 10, windowSeconds: 300 })
      const result = await authService.loginWithGoogle(input.idToken)
      if (!result.success) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: result.error.message })
      }
      return result.data
    }),

  logout: authedProcedure
    .mutation(async ({ ctx }) => {
      const authHeader = ctx.req.headers.get('authorization')
      const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : ''
      const result = await authService.logout(token)
      if (!result.success) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong.' })
      }
      return result.data
    }),

  changePassword: authedProcedure
    .input(changePasswordSchema)
    .mutation(async ({ input, ctx }) => {
      await rateLimit({ key: `ratelimit:change-password:${ctx.user!.id}`, limit: 5, windowSeconds: 300 })
      const authHeader = ctx.req.headers.get('authorization')
      const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : ''
      const result = await authService.changePassword(ctx.user!.id, input, token)
      if (!result.success) {
        throw new TRPCError({
          code: result.error.code === 'UNAUTHORIZED' ? 'UNAUTHORIZED' : 'BAD_REQUEST',
          message: result.error.message,
        })
      }
      return result.data
    }),

  forgotPassword: publicProcedure
    .input(forgotPasswordSchema)
    .mutation(async ({ input, ctx }) => {
      await rateLimit({ key: `ratelimit:forgot-password:email:${input.email.toLowerCase()}`, limit: 3, windowSeconds: 3600 })
      await rateLimit({ key: `ratelimit:forgot-password:ip:${ctx.ip}`, limit: 3, windowSeconds: 3600 })
      const result = await authService.forgotPassword(input)
      if (!result.success) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong.' })
      }
      return result.data
    }),

  resetPassword: publicProcedure
    .input(resetPasswordSchema)
    .mutation(async ({ input, ctx }) => {
      await rateLimit({ key: `ratelimit:reset-password:ip:${ctx.ip}`, limit: 10, windowSeconds: 3600 })
      const result = await authService.resetPassword(input)
      if (!result.success) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: result.error.message })
      }
      return result.data
    }),

  verifyEmail: publicProcedure
    .input(verifyEmailSchema)
    .mutation(async ({ input, ctx }) => {
      await rateLimit({ key: `ratelimit:verify-email:ip:${ctx.ip}`, limit: 10, windowSeconds: 3600 })
      const result = await authService.verifyEmail(input)
      if (!result.success) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: result.error.message })
      }
      return result.data
    }),

  resendVerification: publicProcedure
    .input(resendVerificationSchema)
    .mutation(async ({ input, ctx }) => {
      await rateLimit({ key: `ratelimit:resend-verification:email:${input.email.toLowerCase()}`, limit: 3, windowSeconds: 3600 })
      await rateLimit({ key: `ratelimit:resend-verification:ip:${ctx.ip}`, limit: 3, windowSeconds: 3600 })
      const result = await authService.resendVerification(input.email)
      if (!result.success) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong.' })
      }
      return result.data
    }),

  refreshToken: publicProcedure
    .input(refreshTokenSchema)
    .mutation(async ({ input }) => {
      const result = await authService.refreshToken(input)
      if (!result.success) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: result.error.message })
      }
      return result.data
    }),

  me: authedProcedure
    .query(async ({ ctx }) => {
      const result = await authService.me(ctx.user!.id)
      if (!result.success) {
        throw new TRPCError({ code: 'NOT_FOUND', message: result.error.message })
      }
      return result.data
    }),

  twoFactor: router({
    setup: authedProcedure
      .mutation(async ({ ctx }) => {
        await rateLimit({ key: `ratelimit:2fa-setup:${ctx.user!.id}`, limit: 5, windowSeconds: 300 })
        const result = await authService.startTwoFactorSetup(ctx.user!.id, ctx.user!.email)
        if (!result.success) {
          throw new TRPCError({ code: 'NOT_FOUND', message: result.error.message })
        }
        return result.data
      }),

    confirmSetup: authedProcedure
      .input(twoFactorVerifySetupSchema)
      .mutation(async ({ input, ctx }) => {
        await rateLimit({ key: `ratelimit:2fa-confirm:${ctx.user!.id}`, limit: 10, windowSeconds: 300 })
        const result = await authService.confirmTwoFactorSetup(ctx.user!.id, input.code)
        if (!result.success) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: result.error.message })
        }
        return result.data
      }),

    disable: authedProcedure
      .input(twoFactorDisableSchema)
      .mutation(async ({ input, ctx }) => {
        // Accepts a password guess, same as login/change-password — needs the
        // same rate-limiting treatment (audit #8), not just the other 2FA
        // mutations.
        await rateLimit({ key: `ratelimit:2fa-disable:${ctx.user!.id}`, limit: 5, windowSeconds: 300 })
        const result = await authService.disableTwoFactor(ctx.user!.id, input.password)
        if (!result.success) {
          const code = result.error.code === 'NOT_FOUND' ? 'NOT_FOUND' : 'UNAUTHORIZED'
          throw new TRPCError({ code, message: result.error.message })
        }
        return { success: true }
      }),
  }),
})
