"use client";
import { useCallback, useState } from "react";

/**
 * Client-side cursor stack on top of the backend's forward-only cursor
 * pagination (`{ items, nextCursor, hasMore }` — see
 * backend/src/shared/pagination/cursor-pagination.ts). The backend only ever
 * hands back a "next" cursor, so "Previous" is implemented here by
 * remembering the stack of cursors already visited and popping it, rather
 * than asking the server for a previous page directly.
 *
 * Usage:
 *   const { cursor, hasPrev, goToNext, goToPrev, reset } = useCursorPagination();
 *   const { data, isLoading } = useOrders({ cursor });
 *   <DataTable
 *     data={data?.items ?? []}
 *     isLoading={isLoading}
 *     pagination={{
 *       hasNext: data?.hasMore ?? false,
 *       hasPrev,
 *       onNext: () => goToNext(data?.nextCursor),
 *       onPrev: goToPrev,
 *     }}
 *     ...
 *   />
 */
export function useCursorPagination() {
  const [cursorStack, setCursorStack] = useState<(string | undefined)[]>([undefined]);
  const cursor = cursorStack[cursorStack.length - 1];

  const goToNext = useCallback((nextCursor?: string) => {
    if (!nextCursor) return;
    setCursorStack((stack) => [...stack, nextCursor]);
  }, []);

  const goToPrev = useCallback(() => {
    setCursorStack((stack) => (stack.length > 1 ? stack.slice(0, -1) : stack));
  }, []);

  const reset = useCallback(() => setCursorStack([undefined]), []);

  return { cursor, hasPrev: cursorStack.length > 1, goToNext, goToPrev, reset };
}
