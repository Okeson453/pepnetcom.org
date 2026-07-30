import { z } from 'zod'
import { router, adminProcedure, authedProcedure, publicProcedure } from '../../trpc/trpc'
import { consultantService } from './consultant.service'
import {
  consultationListSchema,
  consultationCreateSchema,
  consultationUpdateStatusSchema,
  applicationListSchema,
  applicationUpdateStatusSchema,
  universityCreateSchema,
  universityUpdateSchema,
  countryCreateSchema,
  countryUpdateSchema,
  consultantIdSchema,
} from './consultant.schema'
import { TRPCError } from '@trpc/server'

export const consultantRouter = router({
  requests: router({
    list: adminProcedure
      .input(consultationListSchema)
      .query(async ({ input }) => {
        return consultantService.listConsultations(input)
      }),

    create: publicProcedure
      .input(consultationCreateSchema)
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.user?.id ?? ''
        return consultantService.createConsultation(input, userId)
      }),

    updateStatus: adminProcedure
      .input(consultationUpdateStatusSchema)
      .mutation(async ({ input }) => {
        const result = await consultantService.updateConsultationStatus(input.id, input.status)
        if (!result.success) {
          throw new TRPCError({ code: 'NOT_FOUND', message: result.error.message })
        }
        return result.data
      }),
  }),

  applications: router({
    list: adminProcedure
      .input(applicationListSchema)
      .query(async ({ input }) => {
        return consultantService.listApplications(input)
      }),

    getById: authedProcedure
      .input(consultantIdSchema)
      .query(async ({ input, ctx }) => {
        const result = await consultantService.getApplicationById(input.id, ctx.user!.id, ctx.user!.role)
        if (!result.success) {
          throw new TRPCError({
            code: result.error.code === 'NOT_FOUND' ? 'NOT_FOUND' : 'FORBIDDEN',
            message: result.error.message,
          })
        }
        return result.data
      }),

    updateStatus: adminProcedure
      .input(applicationUpdateStatusSchema)
      .mutation(async ({ input }) => {
        const result = await consultantService.updateApplicationStatus(input.id, input.status)
        if (!result.success) {
          throw new TRPCError({ code: 'NOT_FOUND', message: result.error.message })
        }
        return result.data
      }),
  }),

  universities: router({
    list: publicProcedure.query(async () => {
      return consultantService.listUniversities()
    }),

    create: adminProcedure
      .input(universityCreateSchema)
      .mutation(async ({ input }) => {
        const result = await consultantService.createUniversity(input)
        if (!result.success) {
          throw new TRPCError({ code: 'CONFLICT', message: result.error.message })
        }
        return result.data
      }),

    update: adminProcedure
      .input(z.object({ id: z.string().cuid(), data: universityUpdateSchema }))
      .mutation(async ({ input }) => {
        const result = await consultantService.updateUniversity(input.id, input.data)
        if (!result.success) {
          throw new TRPCError({ code: 'NOT_FOUND', message: result.error.message })
        }
        return result.data
      }),
  }),

  countries: router({
    list: publicProcedure.query(async () => {
      return consultantService.listCountries()
    }),

    create: adminProcedure
      .input(countryCreateSchema)
      .mutation(async ({ input }) => {
        const result = await consultantService.createCountry(input)
        if (!result.success) {
          throw new TRPCError({ code: 'CONFLICT', message: result.error.message })
        }
        return result.data
      }),

    update: adminProcedure
      .input(z.object({ id: z.string().cuid(), data: countryUpdateSchema }))
      .mutation(async ({ input }) => {
        const result = await consultantService.updateCountry(input.id, input.data)
        if (!result.success) {
          throw new TRPCError({ code: 'NOT_FOUND', message: result.error.message })
        }
        return result.data
      }),
  }),
})
