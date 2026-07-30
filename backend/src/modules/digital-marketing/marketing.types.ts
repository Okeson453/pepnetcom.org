import type { MarketingProject, Campaign, MarketingReport, Deliverable } from '@prisma/client'

export interface ProjectWithCampaigns extends MarketingProject {
  campaigns: Campaign[]
}
