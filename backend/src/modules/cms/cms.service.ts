import { cmsRepository } from './cms.repository'
import { Ok, Err } from '../../shared/result'
import { NotFoundError } from '../../shared/errors/domain-error'
import type { Result } from '../../shared/result'
import type { BlogPost, Category, MediaAsset, Testimonial, Faq } from '@prisma/client'

export class CmsService {
  constructor(private repo = cmsRepository) {}

  // Blog
  async listBlogPosts(input: any): Promise<{ items: BlogPost[]; nextCursor?: string; hasMore: boolean }> {
    const where: any = { status: 'PUBLISHED' }
    if (input.categoryId) where.categoryId = input.categoryId
    if (input.search) {
      where.OR = [
        { title: { contains: input.search, mode: 'insensitive' } },
        { content: { contains: input.search, mode: 'insensitive' } },
      ]
    }

    const take = (input.limit ?? 20) + 1
    const posts = await this.repo.findBlogPosts({
      where,
      take,
      cursor: input.cursor ? { id: input.cursor } : undefined,
    })

    const hasMore = posts.length > (input.limit ?? 20)
    const items = hasMore ? posts.slice(0, input.limit ?? 20) : posts
    const nextCursor = hasMore ? items[items.length - 1]?.id : undefined

    return { items, nextCursor, hasMore }
  }

  async getBlogBySlug(slug: string): Promise<Result<BlogPost, NotFoundError>> {
    const post = await this.repo.findBlogPostBySlug(slug)
    if (!post || post.status !== 'PUBLISHED') {
      return Err(new NotFoundError('Blog Post', slug))
    }
    // Increment views
    await this.repo.incrementBlogPostViews(post.id)
    return Ok(post)
  }

  async createBlogPost(input: any, authorId: string): Promise<BlogPost> {
    return this.repo.createBlogPost({
      title: input.title,
      slug: input.slug,
      excerpt: input.excerpt,
      content: input.content,
      coverImage: input.coverImage,
      authorId,
      categoryId: input.categoryId,
      status: input.status,
      publishedAt: input.publishedAt,
    })
  }

  async updateBlogPost(id: string, input: any): Promise<Result<BlogPost, NotFoundError>> {
    const post = await this.repo.findBlogPostById(id)
    if (!post) {
      return Err(new NotFoundError('Blog Post', id))
    }
    const updated = await this.repo.updateBlogPost(id, input)
    return Ok(updated)
  }

  async deleteBlogPost(id: string): Promise<Result<BlogPost, NotFoundError>> {
    const post = await this.repo.findBlogPostById(id)
    if (!post) {
      return Err(new NotFoundError('Blog Post', id))
    }
    await this.repo.deleteBlogPost(id)
    return Ok(post)
  }

  // Categories
  async listCategories(): Promise<Category[]> {
    return this.repo.findCategories()
  }

  async createCategory(input: any): Promise<Category> {
    return this.repo.createCategory({
      name: input.name,
      slug: input.slug,
      description: input.description,
      parentId: input.parentId,
    })
  }

  // Media
  async listMedia(): Promise<MediaAsset[]> {
    return this.repo.findMediaAssets(50)
  }

  async uploadMedia(input: any): Promise<MediaAsset> {
    return this.repo.createMediaAsset({
      filename: input.filename,
      originalName: input.originalName,
      mimeType: input.mimeType,
      size: input.size,
      url: input.url,
      folder: input.folder,
    })
  }

  async deleteMedia(id: string): Promise<Result<MediaAsset, NotFoundError>> {
    const asset = await this.repo.findMediaAssetById(id)
    if (!asset) {
      return Err(new NotFoundError('Media Asset', id))
    }
    await this.repo.deleteMediaAsset(id)
    return Ok(asset)
  }

  // Testimonials
  async listTestimonials(): Promise<Testimonial[]> {
    return this.repo.findTestimonials()
  }

  async createTestimonial(input: any): Promise<Testimonial> {
    return this.repo.createTestimonial({
      name: input.name,
      email: input.email,
      company: input.company,
      content: input.content,
      rating: input.rating,
      isApproved: false,
    })
  }

  async approveTestimonial(id: string, isApproved: boolean): Promise<Result<Testimonial, NotFoundError>> {
    const testimonial = await this.repo.findTestimonialById(id)
    if (!testimonial) {
      return Err(new NotFoundError('Testimonial', id))
    }
    const updated = await this.repo.setTestimonialApproval(id, isApproved)
    return Ok(updated)
  }

  // FAQs
  async listFaqs(): Promise<Faq[]> {
    return this.repo.findFaqs()
  }

  async createFaq(input: any): Promise<Faq> {
    return this.repo.createFaq({
      question: input.question,
      answer: input.answer,
      category: input.category,
      order: input.order,
    })
  }

  async updateFaq(id: string, input: any): Promise<Result<Faq, NotFoundError>> {
    const faq = await this.repo.findFaqById(id)
    if (!faq) {
      return Err(new NotFoundError('FAQ', id))
    }
    const updated = await this.repo.updateFaq(id, input)
    return Ok(updated)
  }
}

export const cmsService = new CmsService()
