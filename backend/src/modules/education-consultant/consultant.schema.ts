import { z } from 'zod'
import { ConsultationStatus, ApplicationStatus } from '@prisma/client'
import { cursorPaginationSchema } from '../../shared/pagination/cursor-pagination'

export const consultationListSchema = cursorPaginationSchema.extend({
  status: z.nativeEnum(ConsultationStatus).optional(),
})

export const consultationCreateSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  serviceType: z.string().min(1),
  message: z.string().min(1),
})

export const consultationUpdateStatusSchema = z.object({
  id: z.string().cuid(),
  status: z.nativeEnum(ConsultationStatus),
})

export const applicationListSchema = cursorPaginationSchema.extend({
  status: z.nativeEnum(ApplicationStatus).optional(),
})

export const applicationUpdateStatusSchema = z.object({
  id: z.string().cuid(),
  status: z.nativeEnum(ApplicationStatus),
})

export const universityCreateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  countryId: z.string().cuid(),
  city: z.string().optional(),
  website: z.string().url().optional(),
  description: z.string().optional(),
  ranking: z.coerce.number().optional(),
})

export const universityUpdateSchema = universityCreateSchema.partial()

export const countryCreateSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(2).max(3),
  flagUrl: z.string().url().optional(),
  description: z.string().optional(),
})

export const countryUpdateSchema = countryCreateSchema.partial()

export const consultantIdSchema = z.object({
  id: z.string().cuid(),
})
