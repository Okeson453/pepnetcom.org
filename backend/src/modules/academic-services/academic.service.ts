import { academicRepository } from './academic.repository'
import { subjectManagementService } from './subject-management.service'
import { assignmentManagementService } from './assignment-management.service'
import { orderAssignmentService } from '../orders/order-assignment.service'
import { Ok, Err } from '../../shared/result'
import { NotFoundError, ForbiddenError } from '../../shared/errors/domain-error'
import type { Result } from '../../shared/result'
import type { Order, Subject, Assignment } from '@prisma/client'

function generateOrderNumber(): string {
  const prefix = 'ACA'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

export class AcademicService {
  constructor(
    private repo = academicRepository,
    private subjectSvc = subjectManagementService,
    private assignmentSvc = assignmentManagementService,
    private assignmentOrderSvc = orderAssignmentService,
  ) {}

  async listOrders(input: any, userId: string, userRole: string): Promise<Result<{ items: Order[]; nextCursor?: string; hasMore: boolean }, never>> {
    const where: any = { serviceType: 'ACADEMIC' }
    if (input.status) where.status = input.status
    if (userRole === 'CLIENT') where.clientId = userId
    if (userRole === 'WRITER') {
      where.assignment = { staffId: userId }
    }
    if (input.clientId && userRole === 'ADMIN') where.clientId = input.clientId

    const take = (input.limit ?? 20) + 1
    const orders = await this.repo.findOrders({
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

  async getOrderById(id: string, userId: string, userRole: string): Promise<Result<Order, NotFoundError | ForbiddenError>> {
    const order = await this.repo.findOrderById(id)
    if (!order) {
      return Err(new NotFoundError('Academic Order', id))
    }
    if (userRole === 'CLIENT' && order.clientId !== userId) {
      return Err(new ForbiddenError())
    }
    if (userRole === 'WRITER' && order.assignment?.staffId !== userId) {
      return Err(new ForbiddenError())
    }
    return Ok(order)
  }

  async createOrder(input: any, clientId: string): Promise<Result<Order, never>> {
    const orderNumber = generateOrderNumber()
    const order = await this.repo.createAcademicOrder({
      orderNumber,
      clientId,
      totalAmount: input.totalAmount,
      currency: input.currency,
      notes: input.notes,
      academicDetail: {
        subjectId: input.subjectId,
        topic: input.topic,
        wordCount: input.wordCount,
        citationStyle: input.citationStyle,
        instructions: input.instructions,
        deadline: input.deadline,
      },
    })
    return Ok(order)
  }

  // Subjects
  async listSubjects(): Promise<Subject[]> {
    return this.subjectSvc.listSubjects()
  }

  async createSubject(input: any): Promise<Result<Subject, any>> {
    return this.subjectSvc.createSubject(input)
  }

  async updateSubject(id: string, input: any): Promise<Result<Subject, any>> {
    return this.subjectSvc.updateSubject(id, input)
  }

  // Assignments
  async listAssignments(userId: string, userRole: string): Promise<Assignment[]> {
    return this.assignmentSvc.listAssignments(userId, userRole)
  }

  async updateAssignmentStatus(id: string, status: string, userId: string): Promise<Result<Assignment, any>> {
    return this.assignmentSvc.updateStatus(id, status, userId)
  }
}

export const academicService = new AcademicService()
