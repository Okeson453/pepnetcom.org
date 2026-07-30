import { z } from "zod";

export const generalSettingsSchema = z.object({
  siteName: z.string().min(1),
  supportEmail: z.string().email(),
});
export type GeneralSettingsInput = z.infer<typeof generalSettingsSchema>;

export const companySettingsSchema = z.object({
  companyName: z.string().min(1),
  address: z.string().min(1),
  phone: z.string().min(1),
});
export type CompanySettingsInput = z.infer<typeof companySettingsSchema>;

export const securitySettingsSchema = z.object({
  twoFactorEnabled: z.boolean(),
  sessionTimeout: z.coerce.number().int().positive(),
});
export type SecuritySettingsInput = z.infer<typeof securitySettingsSchema>;

export const emailSettingsSchema = z.object({
  smtpHost: z.string().min(1),
  smtpPort: z.coerce.number().int().positive(),
  fromAddress: z.string().email(),
});
export type EmailSettingsInput = z.infer<typeof emailSettingsSchema>;

export const smsSettingsSchema = z.object({
  provider: z.string().min(1),
  apiKey: z.string().min(1),
  senderId: z.string().min(1),
});
export type SmsSettingsInput = z.infer<typeof smsSettingsSchema>;

export const apiKeyRevokeSchema = z.object({
  id: z.string().min(1),
});
export type ApiKeyRevokeInput = z.infer<typeof apiKeyRevokeSchema>;

export const backupRestoreSchema = z.object({
  backupId: z.string().min(1).optional(),
});
export type BackupRestoreInput = z.infer<typeof backupRestoreSchema>;
