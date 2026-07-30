import { z } from 'zod'
import { router, adminProcedure, authedProcedure, clientProcedure } from '../../trpc/trpc'
import { marketingService } from './marketing.service'
import {
  projectListSchema,
  projectCreateSchema,
  projectUpdateSchema,
  campaignListSchema,
  campaignCreateSchema,
  campaignUpdateSchema,
  reportListSchema,
  reportGenerateSchema,
  deliverableListSchema,
  deliverableUploadSchema,
  marketingIdSchema,
} from './marketing.schema'
import { TRPCError } from '@trpc/server'

export const marketingRouter = router({
  projects: router({
    list: authedProcedure
      .input(projectListSchema)
      .query(async ({ input, ctx }) => {
        return marketingService.listProjects(input, ctx.user!.id, ctx.user!.role)
      }),

    create: adminProcedure
      .input(projectCreateSchema)
      .mutation(async ({ input }) => {
        return marketingService.createProject(input)
      }),

    getById: authedProcedure
      .input(marketingIdSchema)
      .query(async ({ input, ctx }) => {
        const result = await marketingService.getProjectById(input.id, ctx.user!.id, ctx.user!.role)
        if (!result.success) {
          throw new TRPCError({
            code: result.error.code === 'NOT_FOUND' ? 'NOT_FOUND' : 'FORBIDDEN',
            message: result.error.message,
          })
        }
        return result.data
      }),
  }),

  campaigns: router({
    list: authedProcedure
      .input(campaignListSchema)
      .query(async ({ input, ctx }) => {
        const result = await marketingService.listCampaigns(input.projectId, ctx.user!.id, ctx.user!.role)
        if (!result.success) {
          throw new TRPCError({
            code: result.error.code === 'NOT_FOUND' ? 'NOT_FOUND' : 'FORBIDDEN',
            message: result.error.message,
          })
        }
        return result.data
      }),

    create: adminProcedure
      .input(campaignCreateSchema)
      .mutation(async ({ input }) => {
        return marketingService.createCampaign(input)
      }),

    update: adminProcedure
      .input(campaignUpdateSchema)
      .mutation(async ({ input }) => {
        const result = await marketingService.updateCampaign(input.id, input)
        if (!result.success) {
          throw new TRPCError({ code: 'NOT_FOUND', message: result.error.message })
        }
        return result.data
      }),
  }),

  reports: router({
    list: authedProcedure
      .input(reportListSchema)
      .query(async ({ input, ctx }) => {
        const result = await marketingService.listReports(input.projectId, ctx.user!.id, ctx.user!.role)
        if (!result.success) {
          throw new TRPCError({
            code: result.error.code === 'NOT_FOUND' ? 'NOT_FOUND' : 'FORBIDDEN',
            message: result.error.message,
          })
        }
        return result.data
      }),

    generate: adminProcedure
      .input(reportGenerateSchema)
      .mutation(async ({ input }) => {
        return marketingService.generateReport(input)
      }),
  }),

  deliverables: router({
    list: authedProcedure
      .input(deliverableListSchema)
      .query(async ({ input, ctx }) => {
        const result = await marketingService.listDeliverables(input.projectId, ctx.user!.id, ctx.user!.role)
        if (!result.success) {
          throw new TRPCError({
            code: result.error.code === 'NOT_FOUND' ? 'NOT_FOUND' : 'FORBIDDEN',
            message: result.error.message,
          })
        }
        return result.data
      }),

    upload: adminProcedure
      .input(deliverableUploadSchema)
      .mutation(async ({ input }) => {
        return marketingService.uploadDeliverable(input)
      }),
  }),
})
