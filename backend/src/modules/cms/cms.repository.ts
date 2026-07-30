import { prisma } from '../../shared/db/prisma-client'
import type { BlogPost, Category, MediaAsset, Testimonial, Faq, Prisma } from '@prisma/client'

export class CmsRepository {
  // Blog
  async findBlogPosts(params: {
    where: Prisma.BlogPostWhereInput
    take: number
    cursor?: Prisma.BlogPostWhereUniqueInput
  }): Promise<BlogPost[]> {
    return prisma.blogPost.findMany({
      where: params.where,
      take: params.take,
      cursor: params.cursor,
      orderBy: { publishedAt: 'desc' },
      include: { category: true },
    })
  }

  async findBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    return prisma.blogPost.findUnique({ where: { slug }, include: { category: true } })
  }

  async findBlogPostById(id: string): Promise<BlogPost | null> {
    return prisma.blogPost.findUnique({ where: { id } })
  }

  async incrementBlogPostViews(id: string): Promise<BlogPost> {
    return prisma.blogPost.update({ where: { id }, data: { views: { increment: 1 } } })
  }

  async createBlogPost(data: Prisma.BlogPostUncheckedCreateInput): Promise<BlogPost> {
    return prisma.blogPost.create({ data })
  }

  async updateBlogPost(id: string, data: Prisma.BlogPostUpdateInput): Promise<BlogPost> {
    return prisma.blogPost.update({ where: { id }, data })
  }

  async deleteBlogPost(id: string): Promise<BlogPost> {
    return prisma.blogPost.delete({ where: { id } })
  }

  // Categories
  async findCategories(): Promise<Category[]> {
    return prisma.category.findMany({ include: { children: true }, orderBy: { name: 'asc' } })
  }

  async createCategory(data: Prisma.CategoryUncheckedCreateInput): Promise<Category> {
    return prisma.category.create({ data })
  }

  // Media
  async findMediaAssets(take = 50): Promise<MediaAsset[]> {
    return prisma.mediaAsset.findMany({ orderBy: { createdAt: 'desc' }, take })
  }

  async findMediaAssetById(id: string): Promise<MediaAsset | null> {
    return prisma.mediaAsset.findUnique({ where: { id } })
  }

  async createMediaAsset(data: Prisma.MediaAssetUncheckedCreateInput): Promise<MediaAsset> {
    return prisma.mediaAsset.create({ data })
  }

  async deleteMediaAsset(id: string): Promise<MediaAsset> {
    return prisma.mediaAsset.delete({ where: { id } })
  }

  // Testimonials
  async findTestimonials(): Promise<Testimonial[]> {
    return prisma.testimonial.findMany({ where: { isApproved: true }, orderBy: { createdAt: 'desc' } })
  }

  async findTestimonialById(id: string): Promise<Testimonial | null> {
    return prisma.testimonial.findUnique({ where: { id } })
  }

  async createTestimonial(data: Prisma.TestimonialUncheckedCreateInput): Promise<Testimonial> {
    return prisma.testimonial.create({ data })
  }

  async setTestimonialApproval(id: string, isApproved: boolean): Promise<Testimonial> {
    return prisma.testimonial.update({ where: { id }, data: { isApproved } })
  }

  // FAQs
  async findFaqs(): Promise<Faq[]> {
    return prisma.faq.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } })
  }

  async findFaqById(id: string): Promise<Faq | null> {
    return prisma.faq.findUnique({ where: { id } })
  }

  async createFaq(data: Prisma.FaqUncheckedCreateInput): Promise<Faq> {
    return prisma.faq.create({ data })
  }

  async updateFaq(id: string, data: Prisma.FaqUpdateInput): Promise<Faq> {
    return prisma.faq.update({ where: { id }, data })
  }
}

export const cmsRepository = new CmsRepository()
