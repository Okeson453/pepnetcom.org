import { z } from "zod";

export const messageSendSchema = z.object({
  threadId: z.string().min(1).optional(),
  recipientId: z.string().min(1).optional(),
  body: z.string().min(1),
});
export type MessageSendInput = z.infer<typeof messageSendSchema>;

export const notificationMarkReadSchema = z.object({
  id: z.string().min(1),
});
export type NotificationMarkReadInput = z.infer<typeof notificationMarkReadSchema>;

export const emailBroadcastCreateSchema = z.object({
  subject: z.string().min(1),
  body: z.string().min(1),
});
export type EmailBroadcastCreateInput = z.infer<typeof emailBroadcastCreateSchema>;

export const emailBroadcastSendSchema = z.object({
  broadcastId: z.string().min(1),
});
export type EmailBroadcastSendInput = z.infer<typeof emailBroadcastSendSchema>;
