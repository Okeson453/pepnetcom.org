import { prisma } from '../../shared/db/prisma-client'
import type { User, Role, Permission, Prisma } from '@prisma/client'

export class UsersRepository {
  async findMany(params: {
    where?: Prisma.UserWhereInput
    take?: number
    cursor?: Prisma.UserWhereUniqueInput
    orderBy?: Prisma.UserOrderByWithRelationInput
  }): Promise<User[]> {
    return prisma.user.findMany({
      ...params,
      include: { sessions: false },
    })
  }

  async count(where?: Prisma.UserWhereInput): Promise<number> {
    return prisma.user.count({ where })
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } })
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data })
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({ where: { id }, data })
  }

  async softDelete(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { status: 'INACTIVE', deletedAt: new Date() },
    })
  }

  // Roles
  async findAllRoles(): Promise<Role[]> {
    return prisma.role.findMany({
      include: { permissions: { include: { permission: true } } },
    })
  }

  async findRoleById(id: string): Promise<Role | null> {
    return prisma.role.findUnique({
      where: { id },
      include: { permissions: { include: { permission: true } } },
    })
  }

  async findPermissionsByRoleId(roleId: string): Promise<Permission[]> {
    const rolePerms = await prisma.rolePermission.findMany({
      where: { roleId },
      include: { permission: true },
    })
    return rolePerms.map((rp: { permission: Permission }) => rp.permission)
  }

  async updateRolePermissions(roleId: string, permissionIds: string[]): Promise<void> {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.rolePermission.deleteMany({ where: { roleId } })
      if (permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: permissionIds.map((pid) => ({ roleId, permissionId: pid })),
        })
      }
    })
  }
}

export const usersRepository = new UsersRepository()
