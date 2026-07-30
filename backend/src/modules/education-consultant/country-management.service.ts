import { consultantRepository } from './consultant.repository'
import { Ok, Err } from '../../shared/result'
import { NotFoundError, ConflictError } from '../../shared/errors/domain-error'
import type { Result } from '../../shared/result'
import type { Country } from '@prisma/client'

export class CountryManagementService {
  constructor(private repo = consultantRepository) {}

  async listCountries(): Promise<Country[]> {
    return this.repo.findCountries({ isActive: true })
  }

  async createCountry(input: any): Promise<Result<Country, ConflictError>> {
    const existing = await this.repo.findCountries({ code: input.code })
    if (existing.length > 0) {
      return Err(new ConflictError('Country with this code already exists'))
    }
    const country = await this.repo.createCountry({
      name: input.name,
      code: input.code,
      flagUrl: input.flagUrl,
      description: input.description,
    })
    return Ok(country)
  }

  async updateCountry(id: string, input: any): Promise<Result<Country, NotFoundError>> {
    const country = await this.repo.findCountryById(id)
    if (!country) {
      return Err(new NotFoundError('Country', id))
    }
    const updated = await this.repo.updateCountry(id, input)
    return Ok(updated)
  }
}

export const countryManagementService = new CountryManagementService()
