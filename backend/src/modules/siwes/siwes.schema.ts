import { z } from 'zod'
import { cursorPaginationSchema } from '../../shared/pagination/cursor-pagination'

export const siwesListSchema = cursorPaginationSchema.extend({
  status: z.string().optional(),
})

export const siwesCreateSchema = z.object({
  institutionName: z.string().min(1),
  department: z.string().optional(),
  matricNumber: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  reportFormat: z.string().default('standard'),
  supervisorName: z.string().optional(),
  companyName: z.string().optional(),
  companyAddress: z.string().optional(),
  totalAmount: z.coerce.number().positive(),
  currency: z.string().default('NGN'),
  notes: z.string().optional(),
})

export const siwesUpdateSchema = z.object({
  institutionName: z.string().min(1).optional(),
  department: z.string().optional(),
  matricNumber: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  reportFormat: z.string().optional(),
  supervisorName: z.string().optional(),
  companyName: z.string().optional(),
  companyAddress: z.string().optional(),
})

export const siwesAssignWriterSchema = z.object({
  orderId: z.string().cuid(),
  writerId: z.string().cuid(),
  dueDate: z.coerce.date().optional(),
})

export const siwesUploadReportSchema = z.object({
  orderId: z.string().cuid(),
  reportUrl: z.string().url(),
})

export const siwesIdSchema = z.object({
  id: z.string().cuid(),
})
