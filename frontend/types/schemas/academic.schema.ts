import { z } from "zod";

export const academicSubjectSchema = z.object({
  name: z.string().min(2),
});
export type AcademicSubjectInput = z.infer<typeof academicSubjectSchema>;

export const academicAssignmentStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]),
});
export type AcademicAssignmentStatusInput = z.infer<typeof academicAssignmentStatusSchema>;
