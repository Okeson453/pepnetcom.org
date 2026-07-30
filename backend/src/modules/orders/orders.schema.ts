import { z } from 'zod'
import { ServiceType, OrderStatus } from '@prisma/client'
import { cursorPaginationSchema } from '../../shared/pagination/cursor-pagination'

export const orderListSchema = cursorPaginationSchema.extend({
  serviceType: z.nativeEnum(ServiceType).optional(),
  status: z.nativeEnum(OrderStatus).optional(),
  clientId: z.string().cuid().optional(),
})

export const orderCreateSchema = z.object({
  serviceType: z.nativeEnum(ServiceType),
  totalAmount: z.coerce.number().positive(),
  currency: z.string().default('NGN'),
  notes: z.string().optional(),
})

export const orderUpdateStatusSchema = z.object({
  id: z.string().cuid(),
  status: z.nativeEnum(OrderStatus),
  notes: z.string().optional(),
})

export const orderAssignSchema = z.object({
  orderId: z.string().cuid(),
  staffId: z.string().cuid(),
  dueDate: z.coerce.date().optional(),
})

export const orderCancelSchema = z.object({
  id: z.string().cuid(),
  reason: z.string().optional(),
})

export const orderIdSchema = z.object({
  id: z.string().cuid(),
})

export type OrderListInput = z.infer<typeof orderListSchema>
export type OrderCreateInput = z.infer<typeof orderCreateSchema>
export type OrderUpdateStatusInput = z.infer<typeof orderUpdateStatusSchema>
export type OrderAssignInput = z.infer<typeof orderAssignSchema>
export type OrderCancelInput = z.infer<typeof orderCancelSchema>
