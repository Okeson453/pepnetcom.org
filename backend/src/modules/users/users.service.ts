import { hash } from 'bcryptjs'
import { usersRepository } from './users.repository'
import { rolesPermissionsService } from './roles-permissions.service'
import { Ok, Err } from '../../shared/result'
import { NotFoundError, ConflictError, ForbiddenError } from '../../shared/errors/domain-error'
import type { Result } from '../../shared/result'
import type { UserListInput, UserCreateInput, UserUpdateInput, UserUpdateByAdminInput } from './users.schema'
import type { SafeUser } from './users.types'
import type { User } from '@prisma/client'

function omitPassword(user: User): SafeUser {
  const { passwordHash: _, ...safe } = user
  return safe
}

export class UsersService {
  constructor(
    private repo = usersRepository,
    private rolesSvc = rolesPermissionsService,
  ) {}

  async list(input: UserListInput, requesterRole: string): Promise<Result<{ items: SafeUser[]; nextCursor?: string; hasMore: boolean }, never>> {
    const where: any = { deletedAt: null }
    if (input.role) where.role = input.role
    if (input.status) where.status = input.status
    if (input.search) {
      where.OR = [
        { email: { contains: input.search, mode: 'insensitive' } },
        { firstName: { contains: input.search, mode: 'insensitive' } },
        { lastName: { contains: input.search, mode: 'insensitive' } },
      ]
    }

    const take = (input.limit ?? 20) + 1
    const users = await this.repo.findMany({
      where,
      take,
      cursor: input.cursor ? { id: input.cursor } : undefined,
      orderBy: { createdAt: 'desc' },
    })

    const hasMore = users.length > (input.limit ?? 20)
    const items = hasMore ? users.slice(0, input.limit ?? 20) : users
    const nextCursor = hasMore ? items[items.length - 1]?.id : undefined

    return Ok({ items: items.map(omitPassword), nextCursor, hasMore })
  }

  async getById(id: string): Promise<Result<SafeUser, NotFoundError>> {
    const user = await this.repo.findById(id)
    if (!user || user.deletedAt) {
      return Err(new NotFoundError('User', id))
    }
    return Ok(omitPassword(user))
  }

  async create(input: UserCreateInput): Promise<Result<SafeUser, ConflictError>> {
    const existing = await this.repo.findByEmail(input.email)
    if (existing) {
      return Err(new ConflictError('User with this email already exists'))
    }
    const passwordHash = await hash(input.password, 12)
    const user = await this.repo.create({
      email: input.email.toLowerCase(),
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      role: input.role,
      status: 'ACTIVE',
      emailVerified: true,
    })
    return Ok(omitPassword(user))
  }

  async update(id: string, input: UserUpdateByAdminInput, requesterId: string, requesterRole: string): Promise<Result<SafeUser, NotFoundError | ForbiddenError>> {
    const user = await this.repo.findById(id)
    if (!user || user.deletedAt) {
      return Err(new NotFoundError('User', id))
    }
    if (requesterRole !== 'ADMIN' && requesterId !== id) {
      return Err(new ForbiddenError('You can only update your own profile'))
    }
    const updated = await this.repo.update(id, {
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      avatarUrl: input.avatarUrl,
      role: requesterRole === 'ADMIN' ? input.role : undefined,
      status: requesterRole === 'ADMIN' ? input.status : undefined,
    })
    return Ok(omitPassword(updated))
  }

  async updateProfile(userId: string, input: UserUpdateInput): Promise<Result<SafeUser, NotFoundError>> {
    const user = await this.repo.findById(userId)
    if (!user || user.deletedAt) {
      return Err(new NotFoundError('User'))
    }
    const updated = await this.repo.update(userId, {
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      avatarUrl: input.avatarUrl,
    })
    return Ok(omitPassword(updated))
  }

  async deactivate(id: string): Promise<Result<SafeUser, NotFoundError>> {
    const user = await this.repo.findById(id)
    if (!user || user.deletedAt) {
      return Err(new NotFoundError('User', id))
    }
    const updated = await this.repo.softDelete(id)
    return Ok(omitPassword(updated))
  }
}

export const usersService = new UsersService()
