import { prisma } from '../../shared/db/prisma-client'
import type { SiwesOrderDetail, Prisma } from '@prisma/client'

const siwesOrderInclude = {
  siwesDetail: true,
  client: { select: { id: true, email: true, firstName: true, lastName: true } },
  assignment: { include: { staff: { select: { id: true, email: true, firstName: true, lastName: true } } } },
  statusHistory: { orderBy: { createdAt: 'desc' } },
} satisfies Prisma.OrderInclude

export type SiwesOrderWithRelations = Prisma.OrderGetPayload<{ include: typeof siwesOrderInclude }>

export class SiwesRepository {
  async findMany(params: {
    where?: Prisma.OrderWhereInput
    take?: number
    cursor?: Prisma.OrderWhereUniqueInput
    orderBy?: Prisma.OrderOrderByWithRelationInput
  }): Promise<SiwesOrderWithRelations[]> {
    return prisma.order.findMany({
      ...params,
      include: {
        ...siwesOrderInclude,
        statusHistory: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    })
  }

  async findById(id: string): Promise<SiwesOrderWithRelations | null> {
    return prisma.order.findUnique({
      where: { id, serviceType: 'SIWES' },
      include: siwesOrderInclude,
    })
  }

  async createSiwesOrder(data: {
    orderNumber: string
    clientId: string
    totalAmount: number
    currency: string
    notes?: string
    siwesDetail: Omit<SiwesOrderDetail, 'id' | 'orderId'>
  }): Promise<Order> {
    return prisma.order.create({
      data: {
        orderNumber: data.orderNumber,
        clientId: data.clientId,
        serviceType: 'SIWES',
        totalAmount: data.totalAmount,
        currency: data.currency,
        notes: data.notes,
        status: 'DRAFT',
        siwesDetail: {
          create: data.siwesDetail,
        },
      },
      include: {
        siwesDetail: true,
      },
    })
  }

  async updateSiwesDetail(orderId: string, data: Partial<SiwesOrderDetail>): Promise<SiwesOrderDetail> {
    return prisma.siwesOrderDetail.update({
      where: { orderId },
      data,
    })
  }

  async uploadCompletedReport(orderId: string, reportUrl: string): Promise<SiwesOrderDetail> {
    return prisma.siwesOrderDetail.update({
      where: { orderId },
      data: {
        completedReportUrl: reportUrl,
        uploadedAt: new Date(),
      },
    })
  }
}

export const siwesRepository = new SiwesRepository()
