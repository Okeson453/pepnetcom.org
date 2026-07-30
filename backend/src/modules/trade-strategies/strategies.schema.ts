import { z } from 'zod'
import { cursorPaginationSchema } from '../../shared/pagination/cursor-pagination'

export const strategyListSchema = cursorPaginationSchema.extend({
  category: z.string().optional(),
  difficulty: z.string().optional(),
  search: z.string().optional(),
})

export const strategyCreateSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  content: z.string().min(1),
  price: z.coerce.number().positive(),
  currency: z.string().default('USD'),
  category: z.string().min(1),
  difficulty: z.string().default('beginner'),
  downloadUrl: z.string().url().optional(),
  previewUrl: z.string().url().optional(),
})

export const strategyUpdateSchema = strategyCreateSchema.partial()

export const strategyPurchaseSchema = z.object({
  strategyId: z.string().cuid(),
  gateway: z.enum(['paystack', 'flutterwave', 'stripe']),
  email: z.string().email(),
})

export const strategyIdSchema = z.object({
  id: z.string().cuid(),
})
