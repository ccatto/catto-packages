// @ccatto/react-pages — PageEditorCatto
//
// Create / edit form for a page: title, auto-slug (editable), optional parent,
// Markdown body with live preview (via the injected renderMarkdown), and a
// Draft/Published toggle. Transport-agnostic — Save/Delete call injected handlers.
'use client';

import React, { useMemo, useState } from 'react';
import type {
  CreatePageVars,
  PageNodeDTO,
  PageStatus,
  RenderMarkdown,
} from '../types';
import { DEFAULT_EDITOR_LABELS, type PageEditorLabels } from '../labels';
import { slugify } from '../slugify';
import { PageBodyCatto } from './PageBodyCatto';

export interface PageParentOption {
  id: string;
  label: string;
}

export interface PageEditorCattoProps {
  namespace: string;
  /** The page being edited; omit/null for a new page. */
  page?: PageNodeDTO | null;
  /** parentId for a NEW page (moves on existing pages happen via the tree). */
  parentId?: string | null;
  /** Options for the parent selector on new pages (flatten your tree). */
  parentOptions?: PageParentOption[];
  /** Sanitizing Markdown renderer for the live preview (see PageBodyCatto). */
  renderMarkdown?: RenderMarkdown;
  /** Persist. `id` is present when editing. */
  onSave: (vars: CreatePageVars, id?: string) => Promise<void> | void;
  onDelete?: (id: string) => Promise<void> | void;
  onCancel?: () => void;
  labels?: Partial<PageEditorLabels>;
  className?: string;
  'data-testid'?: string;
}

const field =
  'w-full rounded-lg border border-theme-border bg-theme-surface px-3 py-2 text-sm text-theme-text placeholder:text-theme-text-muted focus:outline-none focus:ring-2 focus:ring-theme-secondary';
const labelCls = 'block text-sm font-medium text-theme-text';

export const PageEditorCatto: React.FC<PageEditorCattoProps> = ({
  namespace,
  page,
  parentId = null,
  parentOptions,
  renderMarkdown,
  onSave,
  onDelete,
  onCancel,
  labels,
  className,
  'data-testid': testId,
}) => {
  const L = { ...DEFAULT_EDITOR_LABELS, ...labels };
  const isEdit = !!page;

  const [title, setTitle] = useState(page?.title ?? '');
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [slug, setSlug] = useState(page?.slug ?? '');
  const [body, setBody] = useState(page?.body ?? '');
  const [excerpt, setExcerpt] = useState(page?.excerpt ?? '');
  const [status, setStatus] = useState<PageStatus>(page?.status ?? 'DRAFT');
  const [parent, setParent] = useState<string | null>(page?.parentId ?? parentId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live slug suggestion until the user edits the slug field.
  const effectiveSlug = slugTouched ? slug : slugify(title);

  const preview = useMemo(
    () => <PageBodyCatto markdown={body} renderMarkdown={renderMarkdown} />,
    [body, renderMarkdown],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || saving) return;
    setSaving(true);
    setError(null);
    try {
      const vars: CreatePageVars = {
        namespace,
        parentId: isEdit ? undefined : parent,
        title: title.trim(),
        slug: effectiveSlug || undefined,
        body,
        excerpt: excerpt || null,
        status,
      };
      await onSave(vars, page?.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : L.genericError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={['w-full space-y-4', className].filter(Boolean).join(' ')}
      data-testid={testId}
    >
      <div className="space-y-1.5">
        <label htmlFor="page-title" className={labelCls}>
          {L.titleLabel}
        </label>
        <input
          id="page-title"
          className={field}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={L.titlePlaceholder}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="page-slug" className={labelCls}>
            {L.slugLabel}
          </label>
          <input
            id="page-slug"
            className={field}
            value={effectiveSlug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="page-status" className={labelCls}>
            {L.statusLabel}
          </label>
          <select
            id="page-status"
            className={field}
            value={status}
            onChange={(e) => setStatus(e.target.value as PageStatus)}
          >
            <option value="DRAFT">{L.draft}</option>
            <option value="PUBLISHED">{L.published}</option>
          </select>
        </div>
      </div>

      {!isEdit && parentOptions && (
        <div className="space-y-1.5">
          <label htmlFor="page-parent" className={labelCls}>
            {L.parentLabel}
          </label>
          <select
            id="page-parent"
            className={field}
            value={parent ?? ''}
            onChange={(e) => setParent(e.target.value || null)}
          >
            <option value="">{L.parentNone}</option>
            {parentOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="page-body" className={labelCls}>
            {L.bodyLabel}
          </label>
          <textarea
            id="page-body"
            className={`${field} min-h-[16rem] resize-y font-mono`}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={L.bodyPlaceholder}
          />
        </div>
        <div className="space-y-1.5">
          <span className={labelCls}>{L.previewLabel}</span>
          <div className="min-h-[16rem] rounded-lg border border-theme-border bg-theme-surface p-3">
            {preview}
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-500">
          {error}
        </p>
      )}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={saving || !title.trim()}
          className="rounded-lg bg-theme-secondary px-4 py-2 text-sm font-semibold text-theme-on-secondary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-theme-secondary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? L.saving : L.save}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-medium text-theme-text-muted hover:bg-theme-surface-secondary"
          >
            {L.cancel}
          </button>
        )}
        {isEdit && onDelete && (
          <button
            type="button"
            onClick={() => page && onDelete(page.id)}
            className="ml-auto rounded-lg px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            {L.delete}
          </button>
        )}
      </div>
    </form>
  );
};

export default PageEditorCatto;
