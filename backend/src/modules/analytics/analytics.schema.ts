import { z } from 'zod'
import { cursorPaginationSchema } from '../../shared/pagination/cursor-pagination'

export const analyticsDateRangeSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
})

export const reportGenerateSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['sales', 'signals', 'website', 'custom']),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  filters: z.record(z.any()).optional(),
})

export const reportListSchema = cursorPaginationSchema
