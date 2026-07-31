import { prisma } from '../../shared/db/prisma-client'
import type { TransactionClient } from '../../shared/db/transaction'
import type { Order, OrderStatusHistory, OrderAssignment, Prisma } from '@prisma/client'

const orderDetailInclude = {
  statusHistory: { orderBy: { createdAt: 'desc' } },
  assignment: true,
  client: { select: { id: true, email: true, firstName: true, lastName: true } },
} satisfies Prisma.OrderInclude

export type OrderWithRelations = Prisma.OrderGetPayload<{ include: typeof orderDetailInclude }>

export class OrdersRepository {
  async findMany(params: {
    where?: Prisma.OrderWhereInput
    take?: number
    cursor?: Prisma.OrderWhereUniqueInput
    orderBy?: Prisma.OrderOrderByWithRelationInput
    include?: Prisma.OrderInclude
  }): Promise<Order[]> {
    return prisma.order.findMany(params)
  }

  async count(where?: Prisma.OrderWhereInput): Promise<number> {
    return prisma.order.count({ where })
  }

  async findById(id: string, includeDetails: true): Promise<OrderWithRelations | null>
  async findById(id: string, includeDetails: false): Promise<Order | null>
  async findById(id: string, includeDetails = true): Promise<Order | OrderWithRelations | null> {
    return prisma.order.findUnique({
      where: { id },
      include: includeDetails ? orderDetailInclude : undefined,
    })
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    return prisma.order.findUnique({ where: { orderNumber } })
  }

  async create(data: {
    orderNumber: string
    clientId: string
    serviceType: string
    totalAmount: number
    currency: string
    notes?: string
  }): Promise<Order> {
    return prisma.order.create({
      data: {
        orderNumber: data.orderNumber,
        clientId: data.clientId,
        serviceType: data.serviceType as any,
        totalAmount: data.totalAmount,
        currency: data.currency,
        notes: data.notes,
        status: 'DRAFT',
      },
    })
  }

  async update(id: string, data: Prisma.OrderUpdateInput): Promise<Order> {
    return prisma.order.update({ where: { id }, data })
  }

  async updateStatus(orderId: string, status: string, notes?: string, createdBy?: string, tx: TransactionClient = prisma): Promise<OrderStatusHistory> {
    await tx.order.update({
      where: { id: orderId },
      data: { status: status as any },
    })
    return tx.orderStatusHistory.create({
      data: {
        orderId,
        status: status as any,
        notes,
        createdBy,
      },
    })
  }

  async createAssignment(data: {
    orderId: string
    staffId: string
    assignedBy: string
    dueDate?: Date
  }): Promise<OrderAssignment> {
    return prisma.orderAssignment.create({ data })
  }

  async deleteAssignment(orderId: string): Promise<void> {
    await prisma.orderAssignment.deleteMany({ where: { orderId } })
  }

  async getStatusHistory(orderId: string): Promise<OrderStatusHistory[]> {
    return prisma.orderStatusHistory.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    })
  }
}

export const ordersRepository = new OrdersRepository()
