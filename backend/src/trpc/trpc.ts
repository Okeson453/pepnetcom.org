import { initTRPC, TRPCError } from '@trpc/server'
import { ZodError } from 'zod'
import type { Context } from './context'
import { hasPermission, type Permission, type Role } from '../shared/rbac/permission-matrix'

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const router = t.router
export const publicProcedure = t.procedure

// Middleware to require authentication
const requireAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' })
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  })
})

// Middleware to require specific role
const requireRole = (...roles: string[]) =>
  t.middleware(({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' })
    }
    if (!roles.includes(ctx.user.role)) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Insufficient role permissions' })
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    })
  })

// Middleware to require a fine-grained permission from the RBAC matrix.
// Use this instead of requireRole where a module needs resource-level
// (read/write/admin) granularity rather than a flat role check.
const requirePermission = (...permissions: Permission[]) =>
  t.middleware(({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' })
    }
    const role = ctx.user.role as Role
    if (!permissions.every((p) => hasPermission(role, p))) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Insufficient permissions' })
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    })
  })

export const authedProcedure = t.procedure.use(requireAuth)
export const adminProcedure = t.procedure.use(requireRole('ADMIN'))
export const clientProcedure = t.procedure.use(requireRole('CLIENT', 'ADMIN'))
export const writerProcedure = t.procedure.use(requireRole('WRITER', 'ADMIN'))

// Permission-scoped procedure builder for finer-grained gating, e.g.
// permissionProcedure('payments:admin')
export const permissionProcedure = (...permissions: Permission[]) => t.procedure.use(requirePermission(...permissions))
