import { z } from 'zod'

export const settingUpdateSchema = z.record(z.any())

export const apiKeyCreateSchema = z.object({
  name: z.string().min(1),
  scopes: z.array(z.string()).default([]),
  expiresAt: z.coerce.date().optional(),
})

export const apiKeyRevokeSchema = z.object({
  id: z.string().cuid(),
})
