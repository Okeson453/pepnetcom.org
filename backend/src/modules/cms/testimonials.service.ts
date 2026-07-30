import { cmsRepository } from './cms.repository'
import { Ok, Err } from '../../shared/result'
import { NotFoundError } from '../../shared/errors/domain-error'
import type { Result } from '../../shared/result'
import type { Testimonial } from '@prisma/client'

export class TestimonialsService {
  constructor(private repo = cmsRepository) {}

  async listTestimonials(): Promise<Testimonial[]> {
    return this.repo.findTestimonials()
  }

  async createTestimonial(input: any): Promise<Testimonial> {
    return this.repo.createTestimonial({
      name: input.name,
      email: input.email,
      company: input.company,
      content: input.content,
      rating: input.rating,
      isApproved: false,
    })
  }

  async approveTestimonial(id: string, isApproved: boolean): Promise<Result<Testimonial, NotFoundError>> {
    const testimonial = await this.repo.findTestimonialById(id)
    if (!testimonial) {
      return Err(new NotFoundError('Testimonial', id))
    }
    const updated = await this.repo.setTestimonialApproval(id, isApproved)
    return Ok(updated)
  }
}

export const testimonialsService = new TestimonialsService()
