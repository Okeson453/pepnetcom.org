import { z } from "zod";

export const signalSchema = z.object({
  pair: z.string().min(3),
  direction: z.enum(["Long", "Short"]),
  entryPrice: z.string(),
  stopLoss: z.string().optional(),
  takeProfit: z.string().optional(),
});

export type SignalInput = z.infer<typeof signalSchema>;

export const signalSubscriberStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["ACTIVE", "CANCELLED"]),
});
export type SignalSubscriberStatusInput = z.infer<typeof signalSubscriberStatusSchema>;
