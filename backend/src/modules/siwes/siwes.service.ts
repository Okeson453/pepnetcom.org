import { siwesRepository } from './siwes.repository'
import { ordersRepository } from '../orders/orders.repository'
import { orderAssignmentService } from '../orders/order-assignment.service'
import { reportUploadService } from './report-upload.service'
import { Ok, Err } from '../../shared/result'
import { NotFoundError, ForbiddenError, ValidationError } from '../../shared/errors/domain-error'
import type { Result } from '../../shared/result'
import type { Order } from '@prisma/client'
import type { SiwesOrderWithRelations } from './siwes.repository'

function generateOrderNumber(): string {
  const prefix = 'SIW'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

export class SiwesService {
  constructor(
    private repo = siwesRepository,
    private orderRepo = ordersRepository,
    private assignmentSvc = orderAssignmentService,
    private uploadSvc = reportUploadService,
  ) {}

  async list(input: any, userId: string, userRole: string): Promise<Result<{ items: Order[]; nextCursor?: string; hasMore: boolean }, never>> {
    const where: any = { serviceType: 'SIWES' }
    if (input.status) where.status = input.status
    if (userRole === 'CLIENT') where.clientId = userId
    if (userRole === 'WRITER') {
      where.assignment = { staffId: userId }
    }

    const take = (input.limit ?? 20) + 1
    const orders = await this.repo.findMany({
      where,
      take,
      cursor: input.cursor ? { id: input.cursor } : undefined,
      orderBy: { createdAt: 'desc' },
    })

    const hasMore = orders.length > (input.limit ?? 20)
    const items = hasMore ? orders.slice(0, input.limit ?? 20) : orders
    const nextCursor = hasMore ? items[items.length - 1]?.id : undefined

    return Ok({ items, nextCursor, hasMore })
  }

  async getById(id: string, userId: string, userRole: string): Promise<Result<SiwesOrderWithRelations, NotFoundError | ForbiddenError>> {
    const order = await this.repo.findById(id)
    if (!order) {
      return Err(new NotFoundError('SIWES Order', id))
    }
    if (userRole === 'CLIENT' && order.clientId !== userId) {
      return Err(new ForbiddenError())
    }
    if (userRole === 'WRITER' && order.assignment?.staffId !== userId) {
      return Err(new ForbiddenError())
    }
    return Ok(order)
  }

  async create(input: any, clientId: string): Promise<Result<Order, never>> {
    const orderNumber = generateOrderNumber()
    const order = await this.repo.createSiwesOrder({
      orderNumber,
      clientId,
      totalAmount: input.totalAmount,
      currency: input.currency,
      notes: input.notes,
      siwesDetail: {
        institutionName: input.institutionName,
        department: input.department,
        matricNumber: input.matricNumber,
        startDate: input.startDate,
        endDate: input.endDate,
        reportFormat: input.reportFormat,
        supervisorName: input.supervisorName,
        companyName: input.companyName,
        companyAddress: input.companyAddress,
      },
    })
    return Ok(order)
  }

  async assignWriter(orderId: string, writerId: string, assignedBy: string, dueDate?: Date): Promise<Result<any, NotFoundError | ValidationError>> {
    return this.assignmentSvc.assignStaff(orderId, writerId, assignedBy, dueDate)
  }

  async uploadCompletedReport(orderId: string, reportUrl: string, userId: string): Promise<Result<any, NotFoundError | ValidationError>> {
    return this.uploadSvc.uploadReport(orderId, reportUrl, userId)
  }

  async updateOrderDetails(orderId: string, data: any, userId: string, userRole: string): Promise<Result<any, NotFoundError | ForbiddenError | ValidationError>> {
    const order = await this.repo.findById(orderId)
    if (!order) {
      return Err(new NotFoundError('SIWES Order', orderId))
    }
    if (userRole === 'WRITER' && order.assignment?.staffId !== userId) {
      return Err(new ForbiddenError())
    }
    const updated = await this.repo.updateSiwesDetail(orderId, data)
    return Ok(updated)
  }
}

export const siwesService = new SiwesService()
