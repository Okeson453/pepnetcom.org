import { z } from 'zod'

export const cursorPaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
})

export type CursorPaginationInput = z.infer<typeof cursorPaginationSchema>

export interface CursorPaginationResult<T> {
  items: T[]
  nextCursor?: string
  hasMore: boolean
}

export function createCursorPagination<T extends { id: string }>(
  items: T[],
  limit: number,
): CursorPaginationResult<T> {
  const hasMore = items.length > limit
  const trimmedItems = hasMore ? items.slice(0, limit) : items
  const nextCursor = hasMore ? trimmedItems[trimmedItems.length - 1]?.id : undefined
  return { items: trimmedItems, nextCursor, hasMore }
}
