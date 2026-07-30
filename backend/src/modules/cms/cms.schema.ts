import { z } from 'zod'
import { PostStatus } from '@prisma/client'
import { cursorPaginationSchema } from '../../shared/pagination/cursor-pagination'

export const blogListSchema = cursorPaginationSchema.extend({
  categoryId: z.string().cuid().optional(),
  status: z.nativeEnum(PostStatus).optional(),
  search: z.string().optional(),
})

export const blogCreateSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().optional(),
  content: z.string().min(1),
  coverImage: z.string().url().optional(),
  categoryId: z.string().cuid().optional(),
  status: z.nativeEnum(PostStatus).default('DRAFT'),
  publishedAt: z.coerce.date().optional(),
})

export const blogUpdateSchema = blogCreateSchema.partial()

export const categoryCreateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  parentId: z.string().cuid().optional(),
})

export const mediaUploadSchema = z.object({
  filename: z.string().min(1),
  originalName: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.coerce.number().positive(),
  url: z.string().url(),
  folder: z.string().default('uploads'),
})

export const testimonialCreateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  company: z.string().optional(),
  content: z.string().min(1),
  rating: z.coerce.number().min(1).max(5).default(5),
})

export const testimonialApproveSchema = z.object({
  id: z.string().cuid(),
  isApproved: z.boolean(),
})

export const faqCreateSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  category: z.string().optional(),
  order: z.coerce.number().default(0),
})

export const faqUpdateSchema = faqCreateSchema.partial()

export const cmsIdSchema = z.object({
  id: z.string().cuid(),
})

export const slugSchema = z.object({
  slug: z.string().min(1),
})
