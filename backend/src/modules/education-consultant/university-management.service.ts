import { consultantRepository } from './consultant.repository'
import { Ok, Err } from '../../shared/result'
import { NotFoundError, ConflictError } from '../../shared/errors/domain-error'
import type { Result } from '../../shared/result'
import type { University } from '@prisma/client'

export class UniversityManagementService {
  constructor(private repo = consultantRepository) {}

  async listUniversities(): Promise<University[]> {
    return this.repo.findUniversities({ isActive: true })
  }

  async createUniversity(input: any): Promise<Result<University, ConflictError>> {
    const existing = await this.repo.findUniversities({ slug: input.slug })
    if (existing.length > 0) {
      return Err(new ConflictError('University with this slug already exists'))
    }
    const university = await this.repo.createUniversity({
      name: input.name,
      slug: input.slug,
      country: { connect: { id: input.countryId } },
      city: input.city,
      website: input.website,
      description: input.description,
      ranking: input.ranking,
    })
    return Ok(university)
  }

  async updateUniversity(id: string, input: any): Promise<Result<University, NotFoundError>> {
    const university = await this.repo.findUniversityById(id)
    if (!university) {
      return Err(new NotFoundError('University', id))
    }
    const updated = await this.repo.updateUniversity(id, input)
    return Ok(updated)
  }
}

export const universityManagementService = new UniversityManagementService()
