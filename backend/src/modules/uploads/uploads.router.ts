import { TRPCError } from '@trpc/server'
import { router, authedProcedure } from '../../trpc/trpc'
import { getUploadUrlSchema } from './uploads.schema'
import { uploadsService } from './uploads.service'
import { rateLimit } from '../../shared/rate-limit/rate-limiter'

export const uploadsRouter = router({
  getUploadUrl: authedProcedure
    .input(getUploadUrlSchema)
    .mutation(async ({ input, ctx }) => {
      // Generates a real (if short-lived) storage write credential — could be
      // hammered to spam storage otherwise (audit #8).
      await rateLimit({ key: `ratelimit:upload-url:${ctx.user!.id}`, limit: 30, windowSeconds: 300 })
      const result = await uploadsService.getUploadUrl(input, ctx.user!.id, ctx.user!.role)
      if (!result.success) {
        const code = result.error.code === 'FORBIDDEN' ? 'FORBIDDEN' : 'BAD_REQUEST'
        throw new TRPCError({ code, message: result.error.message })
      }
      return result.data
    }),
})
