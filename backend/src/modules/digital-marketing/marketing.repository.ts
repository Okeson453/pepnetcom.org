import { prisma } from '../../shared/db/prisma-client'
import type { MarketingProject, Campaign, MarketingReport, Deliverable, Prisma } from '@prisma/client'

export class MarketingRepository {
  // Projects
  async findProjects(params: {
    where?: Prisma.MarketingProjectWhereInput
    take?: number
    cursor?: Prisma.MarketingProjectWhereUniqueInput
    orderBy?: Prisma.MarketingProjectOrderByWithRelationInput
  }): Promise<MarketingProject[]> {
    return prisma.marketingProject.findMany({
      ...params,
      include: {
        client: { select: { id: true, email: true, firstName: true, lastName: true } },
        _count: { select: { campaigns: true, deliverables: true } },
      },
    })
  }

  async findProjectById(id: string): Promise<MarketingProject | null> {
    return prisma.marketingProject.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, email: true, firstName: true, lastName: true } },
        campaigns: true,
        reports: { orderBy: { createdAt: 'desc' } },
        deliverables: { orderBy: { createdAt: 'desc' } },
      },
    })
  }

  async createProject(data: Prisma.MarketingProjectCreateInput): Promise<MarketingProject> {
    return prisma.marketingProject.create({ data })
  }

  async updateProject(id: string, data: Prisma.MarketingProjectUpdateInput): Promise<MarketingProject> {
    return prisma.marketingProject.update({ where: { id }, data })
  }

  // Campaigns
  async findCampaigns(params: {
    where?: Prisma.CampaignWhereInput
    take?: number
    cursor?: Prisma.CampaignWhereUniqueInput
    orderBy?: Prisma.CampaignOrderByWithRelationInput
  }): Promise<Campaign[]> {
    return prisma.campaign.findMany(params)
  }

  async createCampaign(data: Prisma.CampaignCreateInput): Promise<Campaign> {
    return prisma.campaign.create({ data })
  }

  async updateCampaign(id: string, data: Prisma.CampaignUpdateInput): Promise<Campaign> {
    return prisma.campaign.update({ where: { id }, data })
  }

  // Reports
  async findReports(params: {
    where?: Prisma.MarketingReportWhereInput
    take?: number
    cursor?: Prisma.MarketingReportWhereUniqueInput
    orderBy?: Prisma.MarketingReportOrderByWithRelationInput
  }): Promise<MarketingReport[]> {
    return prisma.marketingReport.findMany(params)
  }

  async createReport(data: Prisma.MarketingReportCreateInput): Promise<MarketingReport> {
    return prisma.marketingReport.create({ data })
  }

  // Deliverables
  async findDeliverables(params: {
    where?: Prisma.DeliverableWhereInput
    take?: number
    cursor?: Prisma.DeliverableWhereUniqueInput
    orderBy?: Prisma.DeliverableOrderByWithRelationInput
  }): Promise<Deliverable[]> {
    return prisma.deliverable.findMany(params)
  }

  async createDeliverable(data: Prisma.DeliverableCreateInput): Promise<Deliverable> {
    return prisma.deliverable.create({ data })
  }
}

export const marketingRepository = new MarketingRepository()
