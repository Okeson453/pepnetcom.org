import { prisma } from '../../shared/db/prisma-client'
import type { Setting, ApiKey, Prisma } from '@prisma/client'

const apiKeyUserSelect = { id: true, email: true, firstName: true, lastName: true } as const

export class SettingsRepository {
  // Settings by category
  async findByCategory(category: string): Promise<Setting[]> {
    return prisma.setting.findMany({ where: { category } })
  }

  async upsertMany(category: string, data: Record<string, Prisma.InputJsonValue>): Promise<void> {
    await prisma.$transaction(
      Object.entries(data).map(([key, value]) =>
        prisma.setting.upsert({
          where: { key },
          update: { value, category },
          create: { key, value, category },
        }),
      ),
    )
  }

  // API keys
  async findApiKeys(): Promise<ApiKey[]> {
    return prisma.apiKey.findMany({
      include: { user: { select: apiKeyUserSelect } },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findApiKeyById(id: string): Promise<ApiKey | null> {
    return prisma.apiKey.findUnique({ where: { id } })
  }

  async createApiKey(data: {
    userId: string
    name: string
    keyHash: string
    scopes: string[]
    expiresAt?: Date
  }): Promise<ApiKey> {
    return prisma.apiKey.create({
      data: {
        user: { connect: { id: data.userId } },
        name: data.name,
        keyHash: data.keyHash,
        scopes: data.scopes,
        expiresAt: data.expiresAt,
      },
    })
  }

  async deactivateApiKey(id: string): Promise<ApiKey> {
    return prisma.apiKey.update({ where: { id }, data: { isActive: false } })
  }
}

export const settingsRepository = new SettingsRepository()
