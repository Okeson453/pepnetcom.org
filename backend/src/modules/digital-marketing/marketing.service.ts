import { marketingRepository } from './marketing.repository'
import { campaignManagementService } from './campaign-management.service'
import { clientReportsService } from './client-reports.service'
import { Ok, Err } from '../../shared/result'
import { NotFoundError, ForbiddenError } from '../../shared/errors/domain-error'
import type { Result } from '../../shared/result'
import type { MarketingProject, Deliverable } from '@prisma/client'

export class MarketingService {
  constructor(
    private repo = marketingRepository,
    private campaignSvc = campaignManagementService,
    private reportsSvc = clientReportsService,
  ) {}

  // Projects
  async listProjects(input: any, userId: string, userRole: string): Promise<{ items: MarketingProject[]; nextCursor?: string; hasMore: boolean }> {
    const where: any = {}
    if (input.status) where.status = input.status
    if (userRole === 'CLIENT') where.clientId = userId
    if (input.clientId && userRole === 'ADMIN') where.clientId = input.clientId

    const take = (input.limit ?? 20) + 1
    const projects = await this.repo.findProjects({
      where,
      take,
      cursor: input.cursor ? { id: input.cursor } : undefined,
      orderBy: { createdAt: 'desc' },
    })

    const hasMore = projects.length > (input.limit ?? 20)
    const items = hasMore ? projects.slice(0, input.limit ?? 20) : projects
    const nextCursor = hasMore ? items[items.length - 1]?.id : undefined

    return { items, nextCursor, hasMore }
  }

  async getProjectById(id: string, userId: string, userRole: string): Promise<Result<MarketingProject, NotFoundError | ForbiddenError>> {
    const project = await this.repo.findProjectById(id)
    if (!project) {
      return Err(new NotFoundError('Project', id))
    }
    if (userRole === 'CLIENT' && project.clientId !== userId) {
      return Err(new ForbiddenError())
    }
    return Ok(project)
  }

  async createProject(input: any): Promise<MarketingProject> {
    return this.repo.createProject({
      client: { connect: { id: input.clientId } },
      name: input.name,
      description: input.description,
      budget: input.budget,
      startDate: input.startDate,
      endDate: input.endDate,
      status: 'ACTIVE',
    })
  }

  // Shared ownership gate for the three project-scoped list methods below.
  // getProjectById already had this; listCampaigns/listReports/listDeliverables
  // didn't — a client who knew (or was shown, e.g. via a URL) any project's
  // id could list its campaigns/reports/deliverables regardless of whose
  // project it was.
  private async assertProjectAccess(
    projectId: string,
    userId: string,
    userRole: string,
  ): Promise<Result<true, NotFoundError | ForbiddenError>> {
    const project = await this.repo.findProjectById(projectId)
    if (!project) {
      return Err(new NotFoundError('Project', projectId))
    }
    if (userRole === 'CLIENT' && project.clientId !== userId) {
      return Err(new ForbiddenError())
    }
    return Ok(true)
  }

  // Campaigns
  async listCampaigns(projectId: string, userId: string, userRole: string): Promise<Result<any[], NotFoundError | ForbiddenError>> {
    const access = await this.assertProjectAccess(projectId, userId, userRole)
    if (!access.success) return access
    return Ok(await this.campaignSvc.listCampaigns(projectId))
  }

  async createCampaign(input: any): Promise<any> {
    return this.campaignSvc.createCampaign(input)
  }

  async updateCampaign(id: string, input: any): Promise<Result<any, any>> {
    return this.campaignSvc.updateCampaign(id, input)
  }

  // Reports
  async listReports(projectId: string, userId: string, userRole: string): Promise<Result<any[], NotFoundError | ForbiddenError>> {
    const access = await this.assertProjectAccess(projectId, userId, userRole)
    if (!access.success) return access
    return Ok(await this.reportsSvc.listReports(projectId))
  }

  async generateReport(input: any): Promise<any> {
    return this.reportsSvc.generateReport(input)
  }

  // Deliverables
  async listDeliverables(projectId: string, userId: string, userRole: string): Promise<Result<Deliverable[], NotFoundError | ForbiddenError>> {
    const access = await this.assertProjectAccess(projectId, userId, userRole)
    if (!access.success) return access
    const deliverables = await this.repo.findDeliverables({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    })
    return Ok(deliverables)
  }

  async uploadDeliverable(input: any): Promise<Deliverable> {
    return this.repo.createDeliverable({
      project: { connect: { id: input.projectId } },
      title: input.title,
      description: input.description,
      fileUrl: input.fileUrl,
      fileType: input.fileType,
      fileSize: input.fileSize,
      status: 'PENDING',
    })
  }
}

export const marketingService = new MarketingService()
