import { z } from "zod";

export const ticketCreateSchema = z.object({
  subject: z.string().min(2),
  message: z.string().min(5),
});
export type TicketCreateInput = z.infer<typeof ticketCreateSchema>;

export const ticketReplySchema = z.object({
  ticketId: z.string().min(1),
  body: z.string().min(1),
});
export type TicketReplyInput = z.infer<typeof ticketReplySchema>;
