import { academicRepository } from './academic.repository'
import { Ok, Err } from '../../shared/result'
import { NotFoundError } from '../../shared/errors/domain-error'
import type { Result } from '../../shared/result'
import type { Assignment } from '@prisma/client'

export class AssignmentManagementService {
  constructor(private repo = academicRepository) {}

  async listAssignments(userId: string, userRole: string): Promise<Assignment[]> {
    if (userRole === 'ADMIN') {
      return this.repo.findAssignments()
    }
    // Writers see assignments for their subjects or all
    return this.repo.findAssignments()
  }

  async updateStatus(id: string, status: string, userId: string): Promise<Result<Assignment, NotFoundError>> {
    const assignment = await this.repo.findAssignments({ id })
    if (assignment.length === 0) {
      return Err(new NotFoundError('Assignment', id))
    }
    const updated = await this.repo.updateAssignment(id, {
      status: status as any,
      completedAt: status === 'COMPLETED' ? new Date() : undefined,
    })
    return Ok(updated)
  }
}

export const assignmentManagementService = new AssignmentManagementService()
