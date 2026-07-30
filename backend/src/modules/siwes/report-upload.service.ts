import { siwesRepository } from './siwes.repository'
import { ordersRepository } from '../orders/orders.repository'
import { Ok, Err } from '../../shared/result'
import { NotFoundError, ValidationError } from '../../shared/errors/domain-error'
import type { Result } from '../../shared/result'
import type { SiwesOrderDetail } from '@prisma/client'

export class ReportUploadService {
  constructor(
    private repo = siwesRepository,
    private orderRepo = ordersRepository,
  ) {}

  async uploadReport(orderId: string, reportUrl: string, userId: string): Promise<Result<SiwesOrderDetail, NotFoundError | ValidationError>> {
    const order = await this.orderRepo.findById(orderId)
    if (!order || order.serviceType !== 'SIWES') {
      return Err(new NotFoundError('SIWES Order', orderId))
    }
    if (order.assignment?.staffId !== userId) {
      return Err(new ValidationError('Only the assigned writer can upload the report'))
    }
    if (order.status !== 'IN_PROGRESS' && order.status !== 'ASSIGNED') {
      return Err(new ValidationError('Order must be in progress to upload report'))
    }

    const detail = await this.repo.uploadCompletedReport(orderId, reportUrl)
    await this.orderRepo.updateStatus(orderId, 'DELIVERED', 'Report uploaded', userId)
    return Ok(detail)
  }
}

export const reportUploadService = new ReportUploadService()
