// @ccatto/ui - useServerPagingCatto Hook
// Data-source-agnostic "Load more" state for server-driven lists.
// Owns the `limit` (take) only — it knows nothing about Apollo/fetch/GraphQL.
// Feed the returned `limit` into your own query's pagination variables.
"use client";

import { useCallback, useRef, useState } from "react";

export interface UseServerPagingCattoOptions {
  /** Total number of records available on the server (from your query's count). */
  total: number;
  /** Page increment; also the initial limit (default: 24). */
  pageSize?: number;
  /**
   * When this value changes (compared via JSON.stringify), `limit` resets to
   * `pageSize` — so filter/search/sort changes go back to page 1. Pass an array
   * of every input that should trigger a reset, e.g. `[brand, search, sortKey]`.
   */
  resetKey?: unknown;
  /**
   * Override the "Showing X of N" caption. Receives the count the consumer is
   * actually rendering and the total.
   */
  label?: (shown: number, total: number) => string;
}

export interface UseServerPagingCattoReturn {
  /** Current fetch cap — feed into your query as `take` / `first` / `limit`. */
  limit: number;
  /** Increment `limit` by `pageSize`. */
  loadMore: () => void;
  /** Reset `limit` back to `pageSize` (page 1). */
  reset: () => void;
  /** True while there are more records to load (`min(limit, total) < total`). */
  hasMore: boolean;
  /** Caption builder, e.g. `showing(items.length)` -> "Showing 48 of 704". */
  showing: (shown: number) => string;
}

const defaultLabel = (shown: number, total: number): string =>
  `Showing ${shown} of ${total}`;

/**
 * useServerPagingCatto — UI-only "Load more" state for server-paginated lists.
 *
 * @example
 * const { limit, loadMore, hasMore, showing } = useServerPagingCatto({
 *   total,
 *   pageSize: 48,
 *   resetKey: [brandSlug, shapes, search, sortKey],
 * });
 * useQuery(QUERY, { variables: { pagination: { take: limit, orderBy, orderDir } } });
 */
export function useServerPagingCatto({
  total,
  pageSize = 24,
  resetKey,
  label = defaultLabel,
}: UseServerPagingCattoOptions): UseServerPagingCattoReturn {
  const [limit, setLimit] = useState(pageSize);

  // Reset to page 1 during render when the reset key changes. This is React's
  // sanctioned "adjust state on prop change" pattern — no effect, no flicker.
  const keyStr = JSON.stringify(resetKey ?? null);
  const prevKey = useRef(keyStr);
  if (prevKey.current !== keyStr) {
    prevKey.current = keyStr;
    setLimit(pageSize);
  }

  const loadMore = useCallback(() => {
    setLimit((l) => l + pageSize);
  }, [pageSize]);

  const reset = useCallback(() => {
    setLimit(pageSize);
  }, [pageSize]);

  const shownCap = Math.min(limit, total);
  const hasMore = shownCap < total;

  const showing = useCallback(
    (shown: number) => label(shown, total),
    [label, total]
  );

  return { limit, loadMore, reset, hasMore, showing };
}

export default useServerPagingCatto;
