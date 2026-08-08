// @ccatto/react-comments — CommentModerationTableCatto
//
// Admin surface: lists the moderation queue with inline approve / hide / remove.
// Self-styled (no @ccatto/ui dependency). Built on useCommentModeration.
'use client';

import React from 'react';
import type { CommentPage, CommentStatus } from '../types';
import {
  DEFAULT_MODERATION_LABELS,
  type CommentModerationLabels,
} from '../labels';
import { useCommentModeration } from '../hooks/useCommentModeration';

export interface CommentModerationTableCattoProps {
  /** Fetch the moderation queue (e.g. `commentsForModeration`). */
  fetchPending: (vars?: {
    status?: CommentStatus;
    take?: number;
    skip?: number;
  }) => Promise<CommentPage>;
  /** Set a comment's status (e.g. `moderateComment`). */
  moderate: (id: string, status: CommentStatus) => Promise<unknown>;
  /** Which status to load (default 'PENDING'). */
  status?: CommentStatus;
  pageSize?: number;
  labels?: Partial<CommentModerationLabels>;
  className?: string;
  'data-testid'?: string;
}

const btn =
  'rounded-md px-2.5 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1';

export const CommentModerationTableCatto: React.FC<
  CommentModerationTableCattoProps
> = ({
  fetchPending,
  moderate,
  status,
  pageSize,
  labels,
  className,
  'data-testid': testId,
}) => {
  const L = { ...DEFAULT_MODERATION_LABELS, ...labels };
  const { items, loading, error, hasMore, loadMore, approve, hide, remove } =
    useCommentModeration({ fetchPending, moderate, status, pageSize });

  return (
    <div
      className={['w-full', className].filter(Boolean).join(' ')}
      data-testid={testId}
    >
      <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
        {L.heading}
      </h2>

      {error && (
        <p
          role="alert"
          className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300"
        >
          {error}
        </p>
      )}

      {items.length === 0 && !loading ? (
        <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-400">
          {L.empty}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:text-gray-400">
                <th className="py-2 pr-3 font-medium">{L.author}</th>
                <th className="py-2 pr-3 font-medium">{L.comment}</th>
                <th className="py-2 pr-3 font-medium">{L.flags}</th>
                <th className="py-2 font-medium">{L.actions}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-gray-100 align-top dark:border-gray-800"
                  data-testid="moderation-row"
                >
                  <td className="py-2 pr-3 text-gray-700 dark:text-gray-300">
                    {c.authorName || c.authorId}
                  </td>
                  <td className="max-w-md py-2 pr-3 text-gray-900 dark:text-gray-100">
                    {c.body}
                  </td>
                  <td className="py-2 pr-3 text-gray-500 dark:text-gray-400">
                    {c.flaggedCount}
                  </td>
                  <td className="py-2">
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => approve(c.id)}
                        className={`${btn} bg-green-600 text-white hover:bg-green-500 focus:ring-green-500`}
                      >
                        {L.approve}
                      </button>
                      <button
                        type="button"
                        onClick={() => hide(c.id)}
                        className={`${btn} bg-amber-500 text-white hover:bg-amber-400 focus:ring-amber-400`}
                      >
                        {L.hide}
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(c.id)}
                        className={`${btn} bg-red-600 text-white hover:bg-red-500 focus:ring-red-500`}
                      >
                        {L.remove}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {loading && (
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          {L.loading}
        </p>
      )}
      {hasMore && !loading && (
        <button
          type="button"
          onClick={loadMore}
          className="mt-3 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          {L.loadMore}
        </button>
      )}
    </div>
  );
};

export default CommentModerationTableCatto;
