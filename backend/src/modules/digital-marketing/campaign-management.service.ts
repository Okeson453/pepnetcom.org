import { marketingRepository } from './marketing.repository'
import { Ok, Err } from '../../shared/result'
import { NotFoundError } from '../../shared/errors/domain-error'
import type { Result } from '../../shared/result'
import type { Campaign } from '@prisma/client'

export class CampaignManagementService {
  constructor(private repo = marketingRepository) {}

  async listCampaigns(projectId: string): Promise<Campaign[]> {
    return this.repo.findCampaigns({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async createCampaign(input: any): Promise<Campaign> {
    return this.repo.createCampaign({
      project: { connect: { id: input.projectId } },
      name: input.name,
      description: input.description,
      platform: input.platform,
      budget: input.budget,
      startDate: input.startDate,
      endDate: input.endDate,
    })
  }

  async updateCampaign(id: string, input: any): Promise<Result<Campaign, NotFoundError>> {
    const campaign = await this.repo.findCampaigns({ where: { id } })
    if (campaign.length === 0) {
      return Err(new NotFoundError('Campaign', id))
    }
    const updated = await this.repo.updateCampaign(id, {
      name: input.name,
      description: input.description,
      platform: input.platform,
      budget: input.budget,
      status: input.status,
      startDate: input.startDate,
      endDate: input.endDate,
      metrics: input.metrics,
    })
    return Ok(updated)
  }
}

export const campaignManagementService = new CampaignManagementService()
