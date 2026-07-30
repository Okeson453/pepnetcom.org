import { z } from 'zod'
import { router, permissionProcedure } from '../../trpc/trpc'
import { settingsService } from './settings.service'
import { settingUpdateSchema, apiKeyCreateSchema, apiKeyRevokeSchema } from './settings.schema'
import { TRPCError } from '@trpc/server'

export const settingsRouter = router({
  general: router({
    get: permissionProcedure('settings:read').query(async () => {
      return settingsService.getSettings('general')
    }),
    update: permissionProcedure('settings:admin')
      .input(settingUpdateSchema)
      .mutation(async ({ input }) => {
        await settingsService.updateSettings('general', input)
        return { success: true }
      }),
  }),

  company: router({
    get: permissionProcedure('settings:read').query(async () => {
      return settingsService.getSettings('company')
    }),
    update: permissionProcedure('settings:admin')
      .input(settingUpdateSchema)
      .mutation(async ({ input }) => {
        await settingsService.updateSettings('company', input)
        return { success: true }
      }),
  }),

  security: router({
    get: permissionProcedure('settings:read').query(async () => {
      return settingsService.getSettings('security')
    }),
    update: permissionProcedure('settings:admin')
      .input(settingUpdateSchema)
      .mutation(async ({ input }) => {
        await settingsService.updateSettings('security', input)
        return { success: true }
      }),
  }),

  email: router({
    get: permissionProcedure('settings:read').query(async () => {
      return settingsService.getSettings('email')
    }),
    update: permissionProcedure('settings:admin')
      .input(settingUpdateSchema)
      .mutation(async ({ input }) => {
        await settingsService.updateSettings('email', input)
        return { success: true }
      }),
  }),

  sms: router({
    get: permissionProcedure('settings:read').query(async () => {
      return settingsService.getSettings('sms')
    }),
    update: permissionProcedure('settings:admin')
      .input(settingUpdateSchema)
      .mutation(async ({ input }) => {
        await settingsService.updateSettings('sms', input)
        return { success: true }
      }),
  }),

  apiKeys: router({
    list: permissionProcedure('settings:read').query(async () => {
      return settingsService.listApiKeys()
    }),

    create: permissionProcedure('settings:admin')
      .input(apiKeyCreateSchema)
      .mutation(async ({ input, ctx }) => {
        return settingsService.createApiKey(ctx.user!.id, input)
      }),

    revoke: permissionProcedure('settings:admin')
      .input(apiKeyRevokeSchema)
      .mutation(async ({ input }) => {
        const result = await settingsService.revokeApiKey(input.id)
        if (!result.success) {
          throw new TRPCError({ code: 'NOT_FOUND', message: result.error.message })
        }
        return result.data
      }),
  }),

  backup: router({
    trigger: permissionProcedure('settings:admin').mutation(async () => {
      return settingsService.triggerBackup()
    }),
    restore: permissionProcedure('settings:admin').mutation(async () => {
      return settingsService.restoreBackup()
    }),
  }),
})
