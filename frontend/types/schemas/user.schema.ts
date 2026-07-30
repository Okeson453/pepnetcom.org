import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(["CLIENT", "WRITER", "ADMIN"]),
});

export type UserInput = z.infer<typeof userSchema>;

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  bio: z.string().max(500).optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const updatePermissionsSchema = z.object({
  role: z.enum(["CLIENT", "WRITER", "ADMIN"]),
  permissions: z.array(z.string()),
});
export type UpdatePermissionsInput = z.infer<typeof updatePermissionsSchema>;
