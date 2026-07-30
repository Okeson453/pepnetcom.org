import { z } from "zod";

// Matches the real backend's strategyCreateSchema exactly (see
// pepnetcom-backend/src/modules/trade-strategies/strategies.schema.ts) —
// this is a downloadable content product (title/slug/content/price), not
// the {name/type/description} shape assumed earlier in this project before
// the backend was wired up.
export const tradeStrategySchema = z.object({
  title: z.string().min(1, "Required"),
  slug: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
  content: z.string().min(1, "Required"),
  price: z.coerce.number().positive("Must be a positive number"),
  currency: z.string().default("USD"),
  category: z.string().min(1, "Required"),
  difficulty: z.string().default("beginner"),
  downloadUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  previewUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});
export type TradeStrategyInput = z.infer<typeof tradeStrategySchema>;

export const tradeStrategyUpdateSchema = tradeStrategySchema.partial();
export type TradeStrategyUpdateInput = z.infer<typeof tradeStrategyUpdateSchema>;
