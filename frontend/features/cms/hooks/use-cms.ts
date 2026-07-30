"use client";
import { trpc } from "@/lib/trpc/client";

/** Public — the marketing blog is meant to be visible to anonymous visitors. */
export function useBlogPosts(input: { cursor?: string; limit?: number } = {}) {
  return trpc.cms.blog.list.useQuery(input);
}
export function useBlogPost(slug: string) {
  return trpc.cms.blog.getBySlug.useQuery({ slug }, { enabled: Boolean(slug) });
}
export function useCreateBlogPost() {
  const utils = trpc.useUtils();
  return trpc.cms.blog.create.useMutation({ onSuccess: () => utils.cms.blog.list.invalidate() });
}
export function useUpdateBlogPost() {
  const utils = trpc.useUtils();
  return trpc.cms.blog.update.useMutation({ onSuccess: () => utils.cms.blog.list.invalidate() });
}
export function useDeleteBlogPost() {
  const utils = trpc.useUtils();
  return trpc.cms.blog.delete.useMutation({ onSuccess: () => utils.cms.blog.list.invalidate() });
}
/** Public. */
export function useCategories() {
  return trpc.cms.categories.list.useQuery();
}
export function useCreateCategory(options?: Parameters<typeof trpc.cms.categories.create.useMutation>[0]) {
  const utils = trpc.useUtils();
  return trpc.cms.categories.create.useMutation({
    ...options,
    onSuccess: (...args) => {
      utils.cms.categories.list.invalidate();
      options?.onSuccess?.(...args);
    },
  });
}
export function useMediaLibrary() {
  return trpc.cms.media.list.useQuery();
}
export function useUploadMedia() {
  const utils = trpc.useUtils();
  return trpc.cms.media.upload.useMutation({ onSuccess: () => utils.cms.media.list.invalidate() });
}
export function useDeleteMedia() {
  const utils = trpc.useUtils();
  return trpc.cms.media.delete.useMutation({ onSuccess: () => utils.cms.media.list.invalidate() });
}
/** Public read. */
export function useTestimonials() {
  return trpc.cms.testimonials.list.useQuery();
}
/** Public — anyone can submit a testimonial; an admin approves it before it's shown. */
export function useCreateTestimonial() {
  const utils = trpc.useUtils();
  return trpc.cms.testimonials.create.useMutation({ onSuccess: () => utils.cms.testimonials.list.invalidate() });
}
export function useApproveTestimonial() {
  const utils = trpc.useUtils();
  return trpc.cms.testimonials.approve.useMutation({ onSuccess: () => utils.cms.testimonials.list.invalidate() });
}
/** Public. */
export function useFaqs() {
  return trpc.cms.faqs.list.useQuery();
}
export function useCreateFaq(options?: Parameters<typeof trpc.cms.faqs.create.useMutation>[0]) {
  const utils = trpc.useUtils();
  return trpc.cms.faqs.create.useMutation({
    ...options,
    onSuccess: (...args) => {
      utils.cms.faqs.list.invalidate();
      options?.onSuccess?.(...args);
    },
  });
}
export function useUpdateFaq() {
  const utils = trpc.useUtils();
  return trpc.cms.faqs.update.useMutation({ onSuccess: () => utils.cms.faqs.list.invalidate() });
}
