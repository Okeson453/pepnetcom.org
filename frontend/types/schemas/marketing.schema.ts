import { z } from "zod";

export const marketingCampaignSchema = z.object({
  name: z.string().min(2),
});
export type MarketingCampaignInput = z.infer<typeof marketingCampaignSchema>;

export const marketingProjectSchema = z.object({
  name: z.string().min(2),
  clientId: z.string().min(1).optional(),
});
export type MarketingProjectInput = z.infer<typeof marketingProjectSchema>;

export const marketingReportGenerateSchema = z.object({
  projectId: z.string().min(1).optional(),
});
export type MarketingReportGenerateInput = z.infer<typeof marketingReportGenerateSchema>;

export const deliverableUploadSchema = z.object({
  fileName: z.string().min(1),
  fileSize: z.number().int().positive(),
  mimeType: z.string().min(1),
});
export type DeliverableUploadInput = z.infer<typeof deliverableUploadSchema>;
