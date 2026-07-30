import { describe, it, expect } from 'vitest'
import { createCursorPagination, cursorPaginationSchema } from '../src/shared/pagination/cursor-pagination'

describe('createCursorPagination', () => {
  it('reports hasMore=false and no nextCursor when items fit within the limit', () => {
    const items = [{ id: 'a' }, { id: 'b' }]
    const result = createCursorPagination(items, 20)
    expect(result.items).toHaveLength(2)
    expect(result.hasMore).toBe(false)
    expect(result.nextCursor).toBeUndefined()
  })

  it('trims to `limit` and sets nextCursor to the last trimmed item when there is an extra item', () => {
    // Callers fetch limit+1 rows to detect "more exists" — simulate that here.
    const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
    const result = createCursorPagination(items, 2)
    expect(result.items).toHaveLength(2)
    expect(result.items.map((i) => i.id)).toEqual(['a', 'b'])
    expect(result.hasMore).toBe(true)
    expect(result.nextCursor).toBe('b')
  })

  it('handles an empty list', () => {
    const result = createCursorPagination([], 20)
    expect(result.items).toHaveLength(0)
    expect(result.hasMore).toBe(false)
    expect(result.nextCursor).toBeUndefined()
  })
})

describe('cursorPaginationSchema', () => {
  it('defaults limit to 20 when omitted', () => {
    const result = cursorPaginationSchema.parse({})
    expect(result.limit).toBe(20)
    expect(result.cursor).toBeUndefined()
  })

  it('rejects a limit above 100', () => {
    const result = cursorPaginationSchema.safeParse({ limit: 101 })
    expect(result.success).toBe(false)
  })

  it('rejects a limit below 1', () => {
    const result = cursorPaginationSchema.safeParse({ limit: 0 })
    expect(result.success).toBe(false)
  })

  it('coerces a numeric-string limit (common from query params)', () => {
    const result = cursorPaginationSchema.parse({ limit: '50' })
    expect(result.limit).toBe(50)
  })
})
