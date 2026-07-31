import { prisma } from '../../shared/db/prisma-client'
import type { Order, AcademicOrderDetail, Subject, Assignment, Prisma } from '@prisma/client'

const academicOrderInclude = {
  academicDetail: { include: { subject: true } },
  client: { select: { id: true, email: true, firstName: true, lastName: true } },
  assignment: { include: { staff: { select: { id: true, email: true, firstName: true, lastName: true } } } },
  statusHistory: { orderBy: { createdAt: 'desc' } },
} satisfies Prisma.OrderInclude

export type AcademicOrderWithRelations = Prisma.OrderGetPayload<{ include: typeof academicOrderInclude }>

export class AcademicRepository {
  async findOrders(params: {
    where?: Prisma.OrderWhereInput
    take?: number
    cursor?: Prisma.OrderWhereUniqueInput
    orderBy?: Prisma.OrderOrderByWithRelationInput
  }): Promise<Order[]> {
    return prisma.order.findMany({
      ...params,
      include: {
        academicDetail: { include: { subject: true } },
        client: { select: { id: true, email: true, firstName: true, lastName: true } },
        assignment: { include: { staff: { select: { id: true, email: true, firstName: true, lastName: true } } } },
      },
    })
  }

  async findOrderById(id: string): Promise<AcademicOrderWithRelations | null> {
    return prisma.order.findUnique({
      where: { id, serviceType: 'ACADEMIC' },
      include: academicOrderInclude,
    })
  }

  async createAcademicOrder(data: {
    orderNumber: string
    clientId: string
    totalAmount: number
    currency: string
    notes?: string
    academicDetail: Omit<AcademicOrderDetail, 'id' | 'orderId'>
  }): Promise<Order> {
    return prisma.order.create({
      data: {
        orderNumber: data.orderNumber,
        clientId: data.clientId,
        serviceType: 'ACADEMIC',
        totalAmount: data.totalAmount,
        currency: data.currency,
        notes: data.notes,
        status: 'DRAFT',
        academicDetail: {
          create: data.academicDetail,
        },
      },
      include: {
        academicDetail: { include: { subject: true } },
      },
    })
  }

  // Subjects
  async findSubjects(where?: Prisma.SubjectWhereInput): Promise<Subject[]> {
    return prisma.subject.findMany({ where, orderBy: { name: 'asc' } })
  }

  async findSubjectById(id: string): Promise<Subject | null> {
    return prisma.subject.findUnique({ where: { id } })
  }

  async createSubject(data: Prisma.SubjectCreateInput): Promise<Subject> {
    return prisma.subject.create({ data })
  }

  async updateSubject(id: string, data: Prisma.SubjectUpdateInput): Promise<Subject> {
    return prisma.subject.update({ where: { id }, data })
  }

  // Assignments
  async findAssignments(where?: Prisma.AssignmentWhereInput): Promise<Assignment[]> {
    return prisma.assignment.findMany({
      where,
      include: { subject: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async updateAssignment(id: string, data: Prisma.AssignmentUpdateInput): Promise<Assignment> {
    return prisma.assignment.update({ where: { id }, data })
  }
}

export const academicRepository = new AcademicRepository()
