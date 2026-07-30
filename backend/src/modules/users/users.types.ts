import type { User, Role, Permission } from '@prisma/client'

export type SafeUser = Omit<User, 'passwordHash'>

export interface RoleWithPermissions extends Role {
  permissions: Permission[]
}
