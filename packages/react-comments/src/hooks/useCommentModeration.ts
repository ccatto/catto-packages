// @ccatto/react-comments — useCommentModeration
//
// Headless moderation state: fetches the queue, and approving/hiding/removing a
// comment drops it from the local list. Wire `fetchPending`/`moderate` to your
// admin GraphQL (e.g. @ccatto/nest-comments' commentsForModeration + moderateComment).
import { useCallback, useEffect, useState } from 'react';
import type { CommentDTO, CommentPage, CommentStatus } from '../types';

export interface UseCommentModerationConfig {
  fetchPending: (vars?: {
    status?: CommentStatus;
    take?: number;
    skip?: number;
  }) => Promise<CommentPage>;
  moderate: (id: string, status: CommentStatus) => Promise<unknown>;
  /** Status to load into the queue. Default 'PENDING'. */
  status?: CommentStatus;
  /** Page size. Default 50. */
  pageSize?: number;
}

export interface UseCommentModerationReturn {
  items: CommentDTO[];
  total: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
  approve: (id: string) => Promise<void>;
  hide: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  moderateOne: (id: string, status: CommentStatus) => Promise<void>;
}

export function useCommentModeration(
  config: UseCommentModerationConfig,
): UseCommentModerationReturn {
  const { fetchPending, moderate, status = 'PENDING', pageSize = 50 } = config;
  const [items, setItems] = useState<CommentDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (nextSkip: number, replace: boolean) => {
      setLoading(true);
      setError(null);
      try {
        const page = await fetchPending({
          status,
          take: pageSize,
          skip: nextSkip,
        });
        setTotal(page.total);
        setItems((prev) => (replace ? page.items : [...prev, ...page.items]));
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    },
    [fetchPending, status, pageSize],
  );

  useEffect(() => {
    setSkip(0);
    void load(0, true);
  }, [load]);

  const loadMore = useCallback(() => {
    const next = skip + pageSize;
    setSkip(next);
    void load(next, false);
  }, [skip, pageSize, load]);

  const refresh = useCallback(() => {
    setSkip(0);
    void load(0, true);
  }, [load]);

  const moderateOne = useCallback(
    async (id: string, next: CommentStatus) => {
      // Optimistically drop from the queue; restore on failure.
      const prev = items;
      setItems((cur) => cur.filter((c) => c.id !== id));
      setTotal((t) => Math.max(0, t - 1));
      try {
        await moderate(id, next);
      } catch (err) {
        setItems(prev);
        setTotal(prev.length);
        setError(err instanceof Error ? err.message : String(err));
      }
    },
    [items, moderate],
  );

  const approve = useCallback(
    (id: string) => moderateOne(id, 'APPROVED'),
    [moderateOne],
  );
  const hide = useCallback(
    (id: string) => moderateOne(id, 'HIDDEN'),
    [moderateOne],
  );
  const remove = useCallback(
    (id: string) => moderateOne(id, 'REMOVED'),
    [moderateOne],
  );

  return {
    items,
    total,
    loading,
    error,
    hasMore: items.length < total,
    loadMore,
    refresh,
    approve,
    hide,
    remove,
    moderateOne,
  };
}

export default useCommentModeration;
