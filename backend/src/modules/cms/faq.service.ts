import { cmsRepository } from './cms.repository'
import { Ok, Err } from '../../shared/result'
import { NotFoundError } from '../../shared/errors/domain-error'
import type { Result } from '../../shared/result'
import type { Faq } from '@prisma/client'

export class FaqService {
  constructor(private repo = cmsRepository) {}

  async listFaqs(): Promise<Faq[]> {
    return this.repo.findFaqs()
  }

  async createFaq(input: any): Promise<Faq> {
    return this.repo.createFaq({
      question: input.question,
      answer: input.answer,
      category: input.category,
      order: input.order,
    })
  }

  async updateFaq(id: string, input: any): Promise<Result<Faq, NotFoundError>> {
    const faq = await this.repo.findFaqById(id)
    if (!faq) {
      return Err(new NotFoundError('FAQ', id))
    }
    const updated = await this.repo.updateFaq(id, input)
    return Ok(updated)
  }
}

export const faqService = new FaqService()
