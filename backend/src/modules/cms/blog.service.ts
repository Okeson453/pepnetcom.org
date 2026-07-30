import { cmsRepository } from './cms.repository'
import { Ok, Err } from '../../shared/result'
import { NotFoundError } from '../../shared/errors/domain-error'
import type { Result } from '../../shared/result'
import type { BlogPost } from '@prisma/client'

export class BlogService {
  constructor(private repo = cmsRepository) {}

  async listPosts(input: any): Promise<{ items: BlogPost[]; nextCursor?: string; hasMore: boolean }> {
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

  async getBySlug(slug: string): Promise<Result<BlogPost, NotFoundError>> {
    const post = await this.repo.findBlogPostBySlug(slug)
    if (!post || post.status !== 'PUBLISHED') {
      return Err(new NotFoundError('Blog Post', slug))
    }
    await this.repo.incrementBlogPostViews(post.id)
    return Ok(post)
  }

  async createPost(input: any, authorId: string): Promise<BlogPost> {
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

  async updatePost(id: string, input: any): Promise<Result<BlogPost, NotFoundError>> {
    const post = await this.repo.findBlogPostById(id)
    if (!post) {
      return Err(new NotFoundError('Blog Post', id))
    }
    const updated = await this.repo.updateBlogPost(id, input)
    return Ok(updated)
  }

  async deletePost(id: string): Promise<Result<BlogPost, NotFoundError>> {
    const post = await this.repo.findBlogPostById(id)
    if (!post) {
      return Err(new NotFoundError('Blog Post', id))
    }
    await this.repo.deleteBlogPost(id)
    return Ok(post)
  }
}

export const blogService = new BlogService()
