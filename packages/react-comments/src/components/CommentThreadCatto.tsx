// @ccatto/react-comments — CommentThreadCatto
//
// Drop-in comment thread: approved comments + a submit form. Transport-agnostic
// (inject async data callbacks). Client-side profanity pre-check is convenience
// only — the server (@ccatto/nest-comments) is authoritative. Self-styled.
'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  CommentDTO,
  CommentPage,
  CommentUser,
  CreateCommentVars,
  FetchCommentsVars,
} from '../types';
import { DEFAULT_THREAD_LABELS, type CommentThreadLabels } from '../labels';

export interface CommentThreadCattoProps {
  entityType: string;
  entityKey: string;
  /** The signed-in user, or null when logged out (shows a sign-in prompt). */
  currentUser?: CommentUser | null;
  /** Governs the "pending review" affordance after posting. Default 'pre'. */
  moderationMode?: 'pre' | 'post';

  // ---- injected data access (wire to Apollo/fetch/etc.) ----
  fetchComments: (vars: FetchCommentsVars) => Promise<CommentPage>;
  createComment: (vars: CreateCommentVars) => Promise<CommentDTO>;
  reportComment?: (id: string) => Promise<void>;

  /** Client-side profanity pre-check for instant feedback (e.g. `isProfane`). */
  profanityCheck?: (text: string) => boolean;
  /** Wire to your app's block system; renders a "Block" affordance when set. */
  onBlockUser?: (authorId: string) => void;
  /** Allow threaded replies (must also be enabled server-side). Default true. */
  allowReplies?: boolean;

  labels?: Partial<CommentThreadLabels>;
  className?: string;
  pageSize?: number;
  'data-testid'?: string;
}

function fmtDate(value: string | Date): string {
  const d = value instanceof Date ? value : new Date(value);
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString();
}

const inputCls =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-gray-700 dark:bg-slate-900 dark:text-gray-50 dark:placeholder-gray-500';

export const CommentThreadCatto: React.FC<CommentThreadCattoProps> = ({
  entityType,
  entityKey,
  currentUser,
  moderationMode = 'pre',
  fetchComments,
  createComment,
  reportComment,
  profanityCheck,
  onBlockUser,
  allowReplies = true,
  labels,
  className,
  pageSize = 50,
  'data-testid': testId,
}) => {
  const L = useMemo(() => ({ ...DEFAULT_THREAD_LABELS, ...labels }), [labels]);

  const [items, setItems] = useState<CommentDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [myPending, setMyPending] = useState<CommentDTO[]>([]);
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(
    null,
  );
  const [reportedIds, setReportedIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const page = await fetchComments({
        entityType,
        entityKey,
        take: pageSize,
        skip: 0,
      });
      setItems(page.items);
      setTotal(page.total);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [fetchComments, entityType, entityKey, pageSize]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const text = body.trim();
      if (!text || submitting) return;
      if (profanityCheck && profanityCheck(text)) {
        setSubmitError(L.profanityError);
        return;
      }
      setSubmitError(null);
      setSubmitting(true);
      try {
        const created = await createComment({
          entityType,
          entityKey,
          body: text,
          parentId: replyTo?.id,
        });
        if (created.status === 'APPROVED') {
          setItems((prev) => [...prev, created]);
          setTotal((t) => t + 1);
        } else {
          setMyPending((prev) => [...prev, created]);
        }
        setBody('');
        setReplyTo(null);
      } catch (err) {
        setSubmitError(
          err instanceof Error && err.message ? err.message : L.genericError,
        );
      } finally {
        setSubmitting(false);
      }
    },
    [
      body,
      submitting,
      profanityCheck,
      L,
      createComment,
      entityType,
      entityKey,
      replyTo,
    ],
  );

  const handleReport = useCallback(
    async (id: string) => {
      if (!reportComment || reportedIds.has(id)) return;
      setReportedIds((prev) => new Set(prev).add(id));
      try {
        await reportComment(id);
      } catch {
        // Roll back the "Reported" affordance on failure.
        setReportedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [reportComment, reportedIds],
  );

  // Group approved comments into top-level + direct replies (one level deep).
  const { topLevel, repliesByParent } = useMemo(() => {
    const top: CommentDTO[] = [];
    const byParent = new Map<string, CommentDTO[]>();
    for (const c of items) {
      if (c.parentId) {
        const arr = byParent.get(c.parentId) ?? [];
        arr.push(c);
        byParent.set(c.parentId, arr);
      } else {
        top.push(c);
      }
    }
    return { topLevel: top, repliesByParent: byParent };
  }, [items]);

  const renderComment = (c: CommentDTO, isReply: boolean, pending = false) => (
    <li
      key={c.id}
      className={isReply ? 'ml-6 mt-3 border-l border-gray-200 pl-4 dark:border-gray-700' : 'mt-4'}
      data-testid="comment"
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {c.authorName || 'User'}
        </span>
        <span className="text-xs text-gray-400">{fmtDate(c.createdAt)}</span>
      </div>
      <p className="mt-1 whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">
        {c.body}
      </p>
      <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs">
        {pending && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
            {L.pendingReview}
          </span>
        )}
        {!pending && currentUser && allowReplies && !isReply && (
          <button
            type="button"
            onClick={() => setReplyTo({ id: c.id, name: c.authorName || 'User' })}
            className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {L.reply}
          </button>
        )}
        {!pending && currentUser && reportComment && (
          <button
            type="button"
            onClick={() => handleReport(c.id)}
            disabled={reportedIds.has(c.id)}
            className="text-gray-500 hover:text-red-600 disabled:cursor-default disabled:text-gray-400 dark:text-gray-400"
          >
            {reportedIds.has(c.id) ? L.reported : L.report}
          </button>
        )}
        {!pending && currentUser && onBlockUser && (
          <button
            type="button"
            onClick={() => onBlockUser(c.authorId)}
            className="text-gray-500 hover:text-red-600 dark:text-gray-400"
          >
            {L.block}
          </button>
        )}
      </div>
      {!isReply &&
        (repliesByParent.get(c.id) ?? []).length > 0 && (
          <ul>
            {(repliesByParent.get(c.id) ?? []).map((r) =>
              renderComment(r, true),
            )}
          </ul>
        )}
    </li>
  );

  const isEmpty =
    !loading && topLevel.length === 0 && myPending.length === 0;

  return (
    <section
      className={['w-full', className].filter(Boolean).join(' ')}
      data-testid={testId}
    >
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        {L.heading}
        {total > 0 && (
          <span className="ml-2 text-sm font-normal text-gray-400">
            {total}
          </span>
        )}
      </h2>

      {/* Composer */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="mt-3 space-y-2">
          {replyTo && (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>{L.replyingTo.replace('{name}', replyTo.name)}</span>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="underline hover:text-gray-800 dark:hover:text-gray-200"
              >
                {L.cancel}
              </button>
            </div>
          )}
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={L.placeholder}
            rows={3}
            className={`${inputCls} resize-y`}
            aria-label={L.placeholder}
          />
          {submitError && (
            <p role="alert" className="text-xs text-red-500">
              {submitError}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting || body.trim().length === 0}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-offset-slate-900"
          >
            {submitting ? L.submitting : L.submit}
          </button>
        </form>
      ) : (
        <p className="mt-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-300">
          {L.signInToComment}
        </p>
      )}

      {loadError && (
        <p
          role="alert"
          className="mt-3 text-sm text-red-500"
        >
          {loadError}
        </p>
      )}

      {/* List */}
      {isEmpty ? (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          {L.empty}
        </p>
      ) : (
        <ul className="mt-2">
          {topLevel.map((c) => renderComment(c, false))}
          {myPending.map((c) => renderComment(c, false, true))}
        </ul>
      )}
    </section>
  );
};

export default CommentThreadCatto;
