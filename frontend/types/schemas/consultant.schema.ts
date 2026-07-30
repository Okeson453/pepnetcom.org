import { z } from "zod";

export const consultantRequestStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["PENDING", "REVIEWED", "CLOSED"]),
});
export type ConsultantRequestStatusInput = z.infer<typeof consultantRequestStatusSchema>;

export const consultantRequestCreateSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
});
export type ConsultantRequestCreateInput = z.infer<typeof consultantRequestCreateSchema>;

export const consultantApplicationStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
});
export type ConsultantApplicationStatusInput = z.infer<typeof consultantApplicationStatusSchema>;

export const universitySchema = z.object({
  name: z.string().min(2),
});
export type UniversityInput = z.infer<typeof universitySchema>;

export const countrySchema = z.object({
  name: z.string().min(2),
});
export type CountryInput = z.infer<typeof countrySchema>;
