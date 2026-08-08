// @ccatto/react-pages — PageAdminTreeCatto
//
// Admin management surface: the page tree with drag-reorder (via @ccatto/ui's
// useDragDropList — desktop, touch, keyboard), plus add-child / edit / delete.
// Self-styled (no @ccatto/ui components, just the hook). Drive it with a
// usePageManager instance.
'use client';

import React from 'react';
import { useDragDropList } from '@ccatto/ui';
import type { PageNodeDTO } from '../types';
import {
  DEFAULT_ADMIN_TREE_LABELS,
  type PageAdminTreeLabels,
} from '../labels';
import type { UsePageManagerReturn } from '../hooks/usePageManager';

export interface PageAdminTreeCattoProps {
  /** A usePageManager instance (owns the tree + mutations). */
  manager: UsePageManagerReturn;
  /** Open your editor for an existing page. */
  onEditPage?: (page: PageNodeDTO) => void;
  /** Open your editor for a new page under `parentId` (null = top level). */
  onAddPage?: (parentId: string | null) => void;
  labels?: Partial<PageAdminTreeLabels>;
  className?: string;
  'data-testid'?: string;
}

const iconBtn =
  'rounded px-2 py-1 text-xs font-medium text-theme-text-muted hover:bg-theme-surface-secondary hover:text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-secondary';

interface BranchProps {
  nodes: PageNodeDTO[];
  parentId: string | null;
  depth: number;
  manager: UsePageManagerReturn;
  L: PageAdminTreeLabels;
  onEditPage?: (page: PageNodeDTO) => void;
  onAddPage?: (parentId: string | null) => void;
}

const AdminBranch: React.FC<BranchProps> = ({
  nodes,
  parentId,
  depth,
  manager,
  L,
  onEditPage,
  onAddPage,
}) => {
  const { items, dragHandlers } = useDragDropList<PageNodeDTO>({
    initialItems: nodes,
    getKey: (p) => p.id,
    onReorder: (reordered) =>
      manager.reorderSiblings(
        parentId,
        reordered.map((p) => p.id),
      ),
  });

  return (
    <ul>
      {items.map((node, index) => (
        <li key={node.id}>
          <div
            {...dragHandlers(index)}
            className="group flex items-center gap-2 rounded-lg py-1.5 pr-2 text-sm text-theme-text hover:bg-theme-surface-secondary focus:outline-none focus:ring-2 focus:ring-theme-secondary"
            style={{ paddingLeft: `${0.25 + depth * 1}rem` }}
            data-testid="admin-page-row"
          >
            <span
              className="cursor-grab select-none text-theme-text-subtle"
              aria-hidden="true"
              title={L.dragHint}
            >
              ⋮⋮
            </span>
            <span className="min-w-0 flex-1 truncate">{node.title}</span>
            {node.status === 'DRAFT' && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                {L.draft}
              </span>
            )}
            <span className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
              {onAddPage && (
                <button
                  type="button"
                  className={iconBtn}
                  onClick={() => onAddPage(node.id)}
                >
                  {L.addChild}
                </button>
              )}
              {onEditPage && (
                <button
                  type="button"
                  className={iconBtn}
                  onClick={() => onEditPage(node)}
                >
                  {L.edit}
                </button>
              )}
              <button
                type="button"
                className={`${iconBtn} hover:text-red-600`}
                onClick={() => manager.deletePage(node.id)}
              >
                {L.delete}
              </button>
            </span>
          </div>
          {node.children.length > 0 && (
            <AdminBranch
              nodes={node.children}
              parentId={node.id}
              depth={depth + 1}
              manager={manager}
              L={L}
              onEditPage={onEditPage}
              onAddPage={onAddPage}
            />
          )}
        </li>
      ))}
    </ul>
  );
};

export const PageAdminTreeCatto: React.FC<PageAdminTreeCattoProps> = ({
  manager,
  onEditPage,
  onAddPage,
  labels,
  className,
  'data-testid': testId,
}) => {
  const L = { ...DEFAULT_ADMIN_TREE_LABELS, ...labels };
  const { tree, loading, error } = manager;

  return (
    <div
      className={['w-full', className].filter(Boolean).join(' ')}
      data-testid={testId}
    >
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-theme-text">{L.heading}</h2>
        {onAddPage && (
          <button
            type="button"
            className="rounded-lg bg-theme-secondary px-3 py-1.5 text-sm font-medium text-theme-on-secondary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-theme-secondary"
            onClick={() => onAddPage(null)}
          >
            {L.addTop}
          </button>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="mb-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300"
        >
          {error}
        </p>
      )}

      {tree.length === 0 && !loading ? (
        <p className="rounded-lg border border-theme-border bg-theme-surface px-4 py-6 text-center text-sm text-theme-text-muted">
          {L.empty}
        </p>
      ) : (
        <AdminBranch
          nodes={tree}
          parentId={null}
          depth={0}
          manager={manager}
          L={L}
          onEditPage={onEditPage}
          onAddPage={onAddPage}
        />
      )}
    </div>
  );
};

export default PageAdminTreeCatto;
