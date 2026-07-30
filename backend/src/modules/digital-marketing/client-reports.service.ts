import { marketingRepository } from './marketing.repository'
import { Ok, Err } from '../../shared/result'
import { NotFoundError } from '../../shared/errors/domain-error'
import type { Result } from '../../shared/result'
import type { MarketingReport } from '@prisma/client'

export class ClientReportsService {
  constructor(private repo = marketingRepository) {}

  async listReports(projectId: string): Promise<MarketingReport[]> {
    return this.repo.findReports({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async generateReport(input: any): Promise<MarketingReport> {
    return this.repo.createReport({
      project: { connect: { id: input.projectId } },
      title: input.title,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
    })
  }
}

export const clientReportsService = new ClientReportsService()
