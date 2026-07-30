import { z } from 'zod'
import { ProjectStatus, CampaignStatus, DeliverableStatus } from '@prisma/client'
import { cursorPaginationSchema } from '../../shared/pagination/cursor-pagination'

export const projectListSchema = cursorPaginationSchema.extend({
  status: z.nativeEnum(ProjectStatus).optional(),
  clientId: z.string().cuid().optional(),
})

export const projectCreateSchema = z.object({
  clientId: z.string().cuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  budget: z.coerce.number().positive().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
})

export const projectUpdateSchema = projectCreateSchema.partial().omit({ clientId: true })

export const campaignListSchema = cursorPaginationSchema.extend({
  projectId: z.string().cuid(),
  status: z.nativeEnum(CampaignStatus).optional(),
})

export const campaignCreateSchema = z.object({
  projectId: z.string().cuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  platform: z.string().min(1),
  budget: z.coerce.number().positive().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
})

export const campaignUpdateSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  platform: z.string().optional(),
  budget: z.coerce.number().positive().optional(),
  status: z.nativeEnum(CampaignStatus).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  metrics: z.record(z.any()).optional(),
})

export const reportListSchema = cursorPaginationSchema.extend({
  projectId: z.string().cuid(),
})

export const reportGenerateSchema = z.object({
  projectId: z.string().cuid(),
  title: z.string().min(1),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
})

export const deliverableListSchema = cursorPaginationSchema.extend({
  projectId: z.string().cuid(),
})

export const deliverableUploadSchema = z.object({
  projectId: z.string().cuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  fileUrl: z.string().url(),
  fileType: z.string().optional(),
  fileSize: z.coerce.number().optional(),
})

export const marketingIdSchema = z.object({
  id: z.string().cuid(),
})
