import { usersRepository } from './users.repository'
import { Ok, Err } from '../../shared/result'
import { NotFoundError } from '../../shared/errors/domain-error'
import type { Result } from '../../shared/result'
import type { Role, Permission } from '@prisma/client'

export class RolesPermissionsService {
  constructor(private repo = usersRepository) {}

  async listRoles(): Promise<Role[]> {
    return this.repo.findAllRoles()
  }

  async getRolePermissions(roleId: string): Promise<Result<Permission[], NotFoundError>> {
    const role = await this.repo.findRoleById(roleId)
    if (!role) {
      return Err(new NotFoundError('Role', roleId))
    }
    const permissions = await this.repo.findPermissionsByRoleId(roleId)
    return Ok(permissions)
  }

  async updateRolePermissions(roleId: string, permissionIds: string[]): Promise<Result<void, NotFoundError>> {
    const role = await this.repo.findRoleById(roleId)
    if (!role) {
      return Err(new NotFoundError('Role', roleId))
    }
    await this.repo.updateRolePermissions(roleId, permissionIds)
    return Ok(undefined)
  }
}

export const rolesPermissionsService = new RolesPermissionsService()
