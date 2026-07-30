import { z } from "zod";

export const refundStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
});
export type RefundStatusInput = z.infer<typeof refundStatusSchema>;

export const gatewayUpdateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});
export type GatewayUpdateInput = z.infer<typeof gatewayUpdateSchema>;

export const subscriptionCancelSchema = z.object({
  id: z.string().min(1),
});
export type SubscriptionCancelInput = z.infer<typeof subscriptionCancelSchema>;
