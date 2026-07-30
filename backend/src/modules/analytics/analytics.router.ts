import { router, adminProcedure } from '../../trpc/trpc'
import { analyticsService } from './analytics.service'
import {
  analyticsDateRangeSchema,
  reportGenerateSchema,
  reportListSchema,
} from './analytics.schema'

export const analyticsRouter = router({
  website: router({
    overview: adminProcedure
      .input(analyticsDateRangeSchema)
      .query(async ({ input }) => {
        return analyticsService.websiteOverview(input.startDate, input.endDate)
      }),
  }),

  sales: router({
    overview: adminProcedure
      .input(analyticsDateRangeSchema)
      .query(async ({ input }) => {
        return analyticsService.salesOverview(input.startDate, input.endDate)
      }),
  }),

  signals: router({
    performance: adminProcedure
      .input(analyticsDateRangeSchema)
      .query(async ({ input }) => {
        return analyticsService.signalsPerformance(input.startDate, input.endDate)
      }),
  }),

  reports: router({
    generate: adminProcedure
      .input(reportGenerateSchema)
      .mutation(async ({ input, ctx }) => {
        return analyticsService.generateReport(input, ctx.user!.id)
      }),

    list: adminProcedure
      .input(reportListSchema)
      .query(async () => {
        return analyticsService.listReports()
      }),
  }),
})
