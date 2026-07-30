import { ordersRepository } from './orders.repository'
import { Ok, Err } from '../../shared/result'
import { NotFoundError, ValidationError } from '../../shared/errors/domain-error'
import type { Result } from '../../shared/result'
import type { OrderAssignment } from '@prisma/client'

export class OrderAssignmentService {
  constructor(private repo = ordersRepository) {}

  async assignStaff(orderId: string, staffId: string, assignedBy: string, dueDate?: Date): Promise<Result<OrderAssignment, NotFoundError | ValidationError>> {
    const order = await this.repo.findById(orderId)
    if (!order) {
      return Err(new NotFoundError('Order', orderId))
    }
    if (order.status !== 'PAID' && order.status !== 'DRAFT') {
      return Err(new ValidationError('Order must be in PAID or DRAFT status to assign staff'))
    }
    if (order.assignment) {
      return Err(new ValidationError('Order is already assigned to a staff member'))
    }

    const assignment = await this.repo.createAssignment({
      orderId,
      staffId,
      assignedBy,
      dueDate,
    })

    // Update order status to ASSIGNED
    await this.repo.updateStatus(orderId, 'ASSIGNED', `Assigned to staff ${staffId}`, assignedBy)

    return Ok(assignment)
  }

  async unassignStaff(orderId: string): Promise<Result<void, NotFoundError>> {
    const order = await this.repo.findById(orderId)
    if (!order) {
      return Err(new NotFoundError('Order', orderId))
    }
    await this.repo.deleteAssignment(orderId)
    return Ok(undefined)
  }
}

export const orderAssignmentService = new OrderAssignmentService()
