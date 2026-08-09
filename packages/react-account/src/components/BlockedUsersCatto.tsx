// @ccatto/react-account — BlockedUsersCatto
//
// Lists the users you've blocked + an Unblock action. Transport-agnostic: inject
// `fetchBlocked` (your query) + `onUnblock` (your mutation). Self-hides when empty.
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import type { BlockedUser } from '../types';
import { DEFAULT_BLOCKED_LABELS, type BlockedUsersLabels } from '../labels';

export interface BlockedUsersCattoProps {
  /** Loads the blocked-users list (e.g. your `myBlockedUsers` query). */
  fetchBlocked: () => Promise<BlockedUser[]>;
  /** Unblocks a user (e.g. your `unblockUser` mutation). */
  onUnblock: (id: string) => Promise<void> | void;
  /** Render the heading/empty state even when the list is empty. Default false (self-hides). */
  showWhenEmpty?: boolean;
  labels?: Partial<BlockedUsersLabels>;
  className?: string;
  'data-testid'?: string;
}

export const BlockedUsersCatto: React.FC<BlockedUsersCattoProps> = ({
  fetchBlocked,
  onUnblock,
  showWhenEmpty = false,
  labels,
  className,
  'data-testid': testId,
}) => {
  const L = { ...DEFAULT_BLOCKED_LABELS, ...labels };
  const [items, setItems] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await fetchBlocked());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [fetchBlocked]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleUnblock = useCallback(
    async (id: string) => {
      setPending((p) => new Set(p).add(id));
      const prev = items;
      setItems((cur) => cur.filter((u) => u.id !== id)); // optimistic
      try {
        await onUnblock(id);
      } catch (err) {
        setItems(prev); // roll back
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setPending((p) => {
          const next = new Set(p);
          next.delete(id);
          return next;
        });
      }
    },
    [items, onUnblock],
  );

  if (!loading && items.length === 0 && !showWhenEmpty && !error) return null;

  return (
    <section
      className={['w-full space-y-2', className].filter(Boolean).join(' ')}
      data-testid={testId}
    >
      <h3 className="text-base font-semibold text-theme-text">{L.heading}</h3>

      {error && (
        <p role="alert" className="text-sm text-red-500">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-theme-text-muted">{L.loading}</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-theme-text-muted">{L.empty}</p>
      ) : (
        <ul className="divide-y divide-theme-border">
          {items.map((u) => (
            <li
              key={u.id}
              className="flex items-center justify-between gap-3 py-2"
              data-testid="blocked-row"
            >
              <span className="min-w-0 truncate text-sm text-theme-text">
                {u.name || u.username || u.id}
              </span>
              <button
                type="button"
                onClick={() => handleUnblock(u.id)}
                disabled={pending.has(u.id)}
                className="shrink-0 rounded-lg border border-theme-border px-3 py-1 text-xs font-medium text-theme-text hover:bg-theme-surface-secondary focus:outline-none focus:ring-2 focus:ring-theme-secondary disabled:opacity-60"
              >
                {pending.has(u.id) ? L.unblocking : L.unblock}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default BlockedUsersCatto;
