import { academicRepository } from './academic.repository'
import { Ok, Err } from '../../shared/result'
import { NotFoundError, ConflictError } from '../../shared/errors/domain-error'
import type { Result } from '../../shared/result'
import type { Subject } from '@prisma/client'

export class SubjectManagementService {
  constructor(private repo = academicRepository) {}

  async listSubjects(): Promise<Subject[]> {
    return this.repo.findSubjects({ isActive: true })
  }

  async createSubject(input: { name: string; code: string; description?: string; category?: string }): Promise<Result<Subject, ConflictError>> {
    const existing = await this.repo.findSubjects({ code: input.code })
    if (existing.length > 0) {
      return Err(new ConflictError('Subject with this code already exists'))
    }
    const subject = await this.repo.createSubject({
      name: input.name,
      code: input.code,
      description: input.description,
      category: input.category,
    })
    return Ok(subject)
  }

  async updateSubject(id: string, input: Partial<{ name: string; code: string; description?: string; category?: string; isActive?: boolean }>): Promise<Result<Subject, NotFoundError>> {
    const subject = await this.repo.findSubjectById(id)
    if (!subject) {
      return Err(new NotFoundError('Subject', id))
    }
    const updated = await this.repo.updateSubject(id, input)
    return Ok(updated)
  }
}

export const subjectManagementService = new SubjectManagementService()
