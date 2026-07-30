import { z } from 'zod'
import { router, adminProcedure, publicProcedure } from '../../trpc/trpc'
import { cmsService } from './cms.service'
import {
  blogListSchema,
  blogCreateSchema,
  blogUpdateSchema,
  categoryCreateSchema,
  mediaUploadSchema,
  testimonialCreateSchema,
  testimonialApproveSchema,
  faqCreateSchema,
  faqUpdateSchema,
  cmsIdSchema,
  slugSchema,
} from './cms.schema'
import { TRPCError } from '@trpc/server'

export const cmsRouter = router({
  blog: router({
    list: publicProcedure
      .input(blogListSchema)
      .query(async ({ input }) => {
        return cmsService.listBlogPosts(input)
      }),

    getBySlug: publicProcedure
      .input(slugSchema)
      .query(async ({ input }) => {
        const result = await cmsService.getBlogBySlug(input.slug)
        if (!result.success) {
          throw new TRPCError({ code: 'NOT_FOUND', message: result.error.message })
        }
        return result.data
      }),

    create: adminProcedure
      .input(blogCreateSchema)
      .mutation(async ({ input, ctx }) => {
        return cmsService.createBlogPost(input, ctx.user!.id)
      }),

    update: adminProcedure
      .input(z.object({ id: z.string().cuid(), data: blogUpdateSchema }))
      .mutation(async ({ input }) => {
        const result = await cmsService.updateBlogPost(input.id, input.data)
        if (!result.success) {
          throw new TRPCError({ code: 'NOT_FOUND', message: result.error.message })
        }
        return result.data
      }),

    delete: adminProcedure
      .input(cmsIdSchema)
      .mutation(async ({ input }) => {
        const result = await cmsService.deleteBlogPost(input.id)
        if (!result.success) {
          throw new TRPCError({ code: 'NOT_FOUND', message: result.error.message })
        }
        return result.data
      }),
  }),

  categories: router({
    list: publicProcedure.query(async () => {
      return cmsService.listCategories()
    }),

    create: adminProcedure
      .input(categoryCreateSchema)
      .mutation(async ({ input }) => {
        return cmsService.createCategory(input)
      }),
  }),

  media: router({
    list: adminProcedure.query(async () => {
      return cmsService.listMedia()
    }),

    upload: adminProcedure
      .input(mediaUploadSchema)
      .mutation(async ({ input }) => {
        return cmsService.uploadMedia(input)
      }),

    delete: adminProcedure
      .input(cmsIdSchema)
      .mutation(async ({ input }) => {
        const result = await cmsService.deleteMedia(input.id)
        if (!result.success) {
          throw new TRPCError({ code: 'NOT_FOUND', message: result.error.message })
        }
        return result.data
      }),
  }),

  testimonials: router({
    list: publicProcedure.query(async () => {
      return cmsService.listTestimonials()
    }),

    create: publicProcedure
      .input(testimonialCreateSchema)
      .mutation(async ({ input }) => {
        return cmsService.createTestimonial(input)
      }),

    approve: adminProcedure
      .input(testimonialApproveSchema)
      .mutation(async ({ input }) => {
        const result = await cmsService.approveTestimonial(input.id, input.isApproved)
        if (!result.success) {
          throw new TRPCError({ code: 'NOT_FOUND', message: result.error.message })
        }
        return result.data
      }),
  }),

  faqs: router({
    list: publicProcedure.query(async () => {
      return cmsService.listFaqs()
    }),

    create: adminProcedure
      .input(faqCreateSchema)
      .mutation(async ({ input }) => {
        return cmsService.createFaq(input)
      }),

    update: adminProcedure
      .input(z.object({ id: z.string().cuid(), data: faqUpdateSchema }))
      .mutation(async ({ input }) => {
        const result = await cmsService.updateFaq(input.id, input.data)
        if (!result.success) {
          throw new TRPCError({ code: 'NOT_FOUND', message: result.error.message })
        }
        return result.data
      }),
  }),
})
