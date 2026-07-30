import { z } from "zod";

export const orderSchema = z.object({
  serviceType: z.enum(["SIWES", "ACADEMIC", "TRADE", "EDUCATION", "MARKETING", "SIGNALS"]),
  requirements: z.string().min(10),
  deadline: z.string().optional(),
});

export type OrderInput = z.infer<typeof orderSchema>;

export const assignStaffSchema = z.object({
  orderId: z.string().min(1),
  staffId: z.string().min(1),
});
export type AssignStaffInput = z.infer<typeof assignStaffSchema>;

export const uploadCompletedReportSchema = z.object({
  orderId: z.string().min(1),
  fileName: z.string().min(1),
  fileSize: z.number().int().positive(),
  mimeType: z.string().min(1),
});
export type UploadCompletedReportInput = z.infer<typeof uploadCompletedReportSchema>;

export const assignWriterSchema = z.object({
  orderId: z.string().min(1),
  writerId: z.string().min(1),
});
export type AssignWriterInput = z.infer<typeof assignWriterSchema>;
