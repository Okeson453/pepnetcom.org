import { router, adminProcedure, authedProcedure } from '../../trpc/trpc'
import { usersService } from './users.service'
import { rolesPermissionsService } from './roles-permissions.service'
import {
  userListSchema,
  userCreateSchema,
  userUpdateSchema,
  userUpdateByAdminSchema,
  userIdSchema,
  rolePermissionsSchema,
} from './users.schema'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const usersRouter = router({
  list: adminProcedure
    .input(userListSchema)
    .query(async ({ input, ctx }) => {
      const result = await usersService.list(input, ctx.user!.role)
      if (!result.success) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong.' })
      }
      return result.data
    }),

  getById: adminProcedure
    .input(userIdSchema)
    .query(async ({ input }) => {
      const result = await usersService.getById(input.id)
      if (!result.success) {
        throw new TRPCError({ code: 'NOT_FOUND', message: result.error.message })
      }
      return result.data
    }),

  create: adminProcedure
    .input(userCreateSchema)
    .mutation(async ({ input }) => {
      const result = await usersService.create(input)
      if (!result.success) {
        throw new TRPCError({ code: 'CONFLICT', message: result.error.message })
      }
      return result.data
    }),

  update: adminProcedure
    .input(z.object({ id: z.string().cuid(), data: userUpdateByAdminSchema }))
    .mutation(async ({ input, ctx }) => {
      const result = await usersService.update(input.id, input.data, ctx.user!.id, ctx.user!.role)
      if (!result.success) {
        throw new TRPCError({ code: result.error.statusCode === 403 ? 'FORBIDDEN' : 'NOT_FOUND', message: result.error.message })
      }
      return result.data
    }),

  deactivate: adminProcedure
    .input(userIdSchema)
    .mutation(async ({ input }) => {
      const result = await usersService.deactivate(input.id)
      if (!result.success) {
        throw new TRPCError({ code: 'NOT_FOUND', message: result.error.message })
      }
      return result.data
    }),

  updateProfile: authedProcedure
    .input(userUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const result = await usersService.updateProfile(ctx.user!.id, input)
      if (!result.success) {
        throw new TRPCError({ code: 'NOT_FOUND', message: result.error.message })
      }
      return result.data
    }),

  roles: router({
    list: adminProcedure.query(async () => {
      return rolesPermissionsService.listRoles()
    }),

    permissions: adminProcedure
      .input(z.object({ roleId: z.string().cuid() }))
      .query(async ({ input }) => {
        const result = await rolesPermissionsService.getRolePermissions(input.roleId)
        if (!result.success) {
          throw new TRPCError({ code: 'NOT_FOUND', message: result.error.message })
        }
        return result.data
      }),

    updatePermissions: adminProcedure
      .input(rolePermissionsSchema)
      .mutation(async ({ input }) => {
        const result = await rolesPermissionsService.updateRolePermissions(input.roleId, input.permissionIds)
        if (!result.success) {
          throw new TRPCError({ code: 'NOT_FOUND', message: result.error.message })
        }
        return result.data
      }),
  }),
})
