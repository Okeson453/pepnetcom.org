import { cmsRepository } from './cms.repository'
import type { Category } from '@prisma/client'

export class CategoriesService {
  constructor(private repo = cmsRepository) {}

  async listCategories(): Promise<Category[]> {
    return this.repo.findCategories()
  }

  async createCategory(input: any): Promise<Category> {
    return this.repo.createCategory({
      name: input.name,
      slug: input.slug,
      description: input.description,
      parentId: input.parentId,
    })
  }
}

export const categoriesService = new CategoriesService()
