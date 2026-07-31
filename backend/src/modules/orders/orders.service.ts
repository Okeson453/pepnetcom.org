import { ordersRepository } from './orders.repository'
import { orderAssignmentService } from './order-assignment.service'
import { assertValidTransition } from './order-status.state-machine'
import { withTransaction } from '../../shared/db/transaction'
import { Ok, Err } from '../../shared/result'
import { NotFoundError, ForbiddenError, ValidationError } from '../../shared/errors/domain-error'
import type { Result } from '../../shared/result'
import type { OrderListInput, OrderCreateInput, OrderUpdateStatusInput, OrderAssignInput, OrderCancelInput } from './orders.schema'
import type { Order, OrderStatusHistory } from '@prisma/client'
import type { OrderWithRelations } from './orders.repository'

function generateOrderNumber(): string {
  const prefix = 'ORD'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

export class OrdersService {
  constructor(
    private repo = ordersRepository,
    private assignmentService = orderAssignmentService,
  ) {}

  async list(input: OrderListInput, userId: string, userRole: string): Promise<Result<{ items: Order[]; nextCursor?: string; hasMore: boolean }, never>> {
    const where: any = {}
    if (input.serviceType) where.serviceType = input.serviceType
    if (input.status) where.status = input.status
    if (userRole === 'CLIENT') where.clientId = userId
    if (userRole === 'WRITER') {
      where.assignment = { staffId: userId }
    }
    if (input.clientId && userRole === 'ADMIN') where.clientId = input.clientId

    const take = (input.limit ?? 20) + 1
    const orders = await this.repo.findMany({
      where,
      take,
      cursor: input.cursor ? { id: input.cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { id: true, email: true, firstName: true, lastName: true } },
        assignment: { include: { staff: { select: { id: true, email: true, firstName: true, lastName: true } } } },
      },
    })

    const hasMore = orders.length > (input.limit ?? 20)
    const items = hasMore ? orders.slice(0, input.limit ?? 20) : orders
    const nextCursor = hasMore ? items[items.length - 1]?.id : undefined

    return Ok({ items, nextCursor, hasMore })
  }

  async getById(id: string, userId: string, userRole: string): Promise<Result<OrderWithRelations, NotFoundError | ForbiddenError>> {
    const order = await this.repo.findById(id)
    if (!order) {
      return Err(new NotFoundError('Order', id))
    }
    if (userRole === 'CLIENT' && order.clientId !== userId) {
      return Err(new ForbiddenError())
    }
    if (userRole === 'WRITER' && order.assignment?.staffId !== userId) {
      return Err(new ForbiddenError())
    }
    return Ok(order)
  }

  async create(input: OrderCreateInput, clientId: string): Promise<Result<Order, never>> {
    const orderNumber = generateOrderNumber()
    const order = await this.repo.create({
      orderNumber,
      clientId,
      serviceType: input.serviceType,
      totalAmount: input.totalAmount,
      currency: input.currency,
      notes: input.notes,
    })
    return Ok(order)
  }

  async updateStatus(input: OrderUpdateStatusInput, userId: string): Promise<Result<OrderStatusHistory, NotFoundError | ValidationError>> {
    const order = await this.repo.findById(input.id, false)
    if (!order) {
      return Err(new NotFoundError('Order', input.id))
    }
    assertValidTransition(order.status, input.status)
    const history = await this.repo.updateStatus(input.id, input.status, input.notes, userId)
    return Ok(history)
  }

  async assignStaff(input: OrderAssignInput, assignedBy: string): Promise<Result<any, NotFoundError | ValidationError>> {
    return this.assignmentService.assignStaff(input.orderId, input.staffId, assignedBy, input.dueDate)
  }

  async cancel(input: OrderCancelInput, userId: string, userRole: string): Promise<Result<Order, NotFoundError | ForbiddenError | ValidationError>> {
    const order = await this.repo.findById(input.id, false)
    if (!order) {
      return Err(new NotFoundError('Order', input.id))
    }
    if (userRole === 'CLIENT' && order.clientId !== userId) {
      return Err(new ForbiddenError())
    }
    if (order.status !== 'DRAFT' && order.status !== 'PENDING_PAYMENT') {
      return Err(new ValidationError('Order can only be cancelled before assignment'))
    }
    const updated = await this.repo.update(input.id, { status: 'CANCELLED' })
    await this.repo.updateStatus(input.id, 'CANCELLED', input.reason, userId)
    return Ok(updated)
  }

  async trackingTimeline(orderId: string, userId: string, userRole: string): Promise<Result<OrderStatusHistory[], NotFoundError | ForbiddenError>> {
    const order = await this.repo.findById(orderId)
    if (!order) {
      return Err(new NotFoundError('Order', orderId))
    }
    if (userRole === 'CLIENT' && order.clientId !== userId) {
      return Err(new ForbiddenError())
    }
    if (userRole === 'WRITER' && order.assignment?.staffId !== userId) {
      return Err(new ForbiddenError())
    }
    const history = await this.repo.getStatusHistory(orderId)
    return Ok(history)
  }
}

export const ordersService = new OrdersService()
