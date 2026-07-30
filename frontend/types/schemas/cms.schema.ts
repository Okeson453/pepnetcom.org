import { z } from "zod";

export const blogPostSchema = z.object({
  title: z.string().min(2),
  slug: z.string().min(2),
  body: z.string().min(1),
  published: z.boolean().default(false),
});
export type BlogPostInput = z.infer<typeof blogPostSchema>;

export const blogPostUpdateSchema = blogPostSchema.partial().extend({
  id: z.string().min(1),
});
export type BlogPostUpdateInput = z.infer<typeof blogPostUpdateSchema>;

export const categorySchema = z.object({
  name: z.string().min(2),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const faqSchema = z.object({
  question: z.string().min(3),
  answer: z.string().min(3),
});
export type FaqInput = z.infer<typeof faqSchema>;

export const faqUpdateSchema = faqSchema.extend({
  id: z.string().min(1),
});
export type FaqUpdateInput = z.infer<typeof faqUpdateSchema>;

export const mediaUploadSchema = z.object({
  fileName: z.string().min(1),
  fileSize: z.number().int().positive(),
  mimeType: z.string().min(1),
});
export type MediaUploadInput = z.infer<typeof mediaUploadSchema>;

export const testimonialApproveSchema = z.object({
  id: z.string().min(1),
});
export type TestimonialApproveInput = z.infer<typeof testimonialApproveSchema>;
