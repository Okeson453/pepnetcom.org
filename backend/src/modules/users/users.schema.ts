import { z } from 'zod'
import { UserRole, UserStatus } from '@prisma/client'
import { cursorPaginationSchema } from '../../shared/pagination/cursor-pagination'

export const userListSchema = cursorPaginationSchema.extend({
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  search: z.string().optional(),
})

export const userCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().optional(),
  role: z.nativeEnum(UserRole).default('CLIENT'),
})

export const userUpdateSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional(),
})

export const userUpdateByAdminSchema = userUpdateSchema.extend({
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
})

export const userIdSchema = z.object({
  id: z.string().cuid(),
})

export const rolePermissionsSchema = z.object({
  roleId: z.string().cuid(),
  permissionIds: z.array(z.string().cuid()),
})

export type UserListInput = z.infer<typeof userListSchema>
export type UserCreateInput = z.infer<typeof userCreateSchema>
export type UserUpdateInput = z.infer<typeof userUpdateSchema>
export type UserUpdateByAdminInput = z.infer<typeof userUpdateByAdminSchema>
