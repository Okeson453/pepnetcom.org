import { z } from 'zod'
import { AssignmentStatus } from '@prisma/client'
import { cursorPaginationSchema } from '../../shared/pagination/cursor-pagination'

export const academicOrderListSchema = cursorPaginationSchema.extend({
  status: z.string().optional(),
  clientId: z.string().cuid().optional(),
})

export const academicOrderCreateSchema = z.object({
  subjectId: z.string().cuid(),
  topic: z.string().min(1),
  wordCount: z.coerce.number().positive().optional(),
  citationStyle: z.string().default('APA'),
  instructions: z.string().optional(),
  deadline: z.coerce.date().optional(),
  totalAmount: z.coerce.number().positive(),
  currency: z.string().default('NGN'),
  notes: z.string().optional(),
})

export const subjectCreateSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
})

export const subjectUpdateSchema = subjectCreateSchema.partial().extend({
  isActive: z.boolean().optional(),
})

export const assignmentUpdateStatusSchema = z.object({
  id: z.string().cuid(),
  status: z.nativeEnum(AssignmentStatus),
})

export const academicIdSchema = z.object({
  id: z.string().cuid(),
})
