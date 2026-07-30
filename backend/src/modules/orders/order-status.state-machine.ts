import { OrderStatus } from '@prisma/client'
import { ValidationError } from '../../shared/errors/domain-error'

// Valid status transitions
const validTransitions: Record<OrderStatus, OrderStatus[]> = {
  DRAFT: ['PENDING_PAYMENT', 'CANCELLED'],
  PENDING_PAYMENT: ['PAID', 'CANCELLED'],
  PAID: ['ASSIGNED', 'CANCELLED', 'REFUNDED'],
  ASSIGNED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['UNDER_REVIEW', 'DELIVERED'],
  UNDER_REVIEW: ['REVISION_REQUESTED', 'DELIVERED', 'COMPLETED'],
  DELIVERED: ['REVISION_REQUESTED', 'COMPLETED'],
  REVISION_REQUESTED: ['IN_PROGRESS'],
  COMPLETED: [],
  CANCELLED: [],
  REFUNDED: [],
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return validTransitions[from]?.includes(to) ?? false
}

export function assertValidTransition(from: OrderStatus, to: OrderStatus): void {
  if (!canTransition(from, to)) {
    throw new ValidationError(`Cannot transition from ${from} to ${to}`)
  }
}

export function getAllowedTransitions(status: OrderStatus): OrderStatus[] {
  return validTransitions[status] ?? []
}
