// @ccatto/react-pages — shared types
//
// Transport-agnostic: the app injects async data callbacks (wire them to Apollo/
// fetch). Mirrors @ccatto/react-comments. The shapes match @ccatto/nest-pages.
import type React from 'react';

export type PageStatus = 'DRAFT' | 'PUBLISHED';

/** A page node as returned by your GraphQL/API (the `nest-pages` PageNode). */
export interface PageNodeDTO {
  id: string;
  namespace: string;
  slug: string;
  parentId?: string | null;
  title: string;
  excerpt?: string | null;
  icon?: string | null;
  status: PageStatus;
  order: number;
  body: string;
  /** Full slug path from the namespace root, e.g. "training/shots/forehand". */
  path: string;
  children: PageNodeDTO[];
}

export interface CreatePageVars {
  namespace: string;
  parentId?: string | null;
  title: string;
  slug?: string;
  body?: string;
  excerpt?: string | null;
  icon?: string | null;
  status?: PageStatus;
}

export interface UpdatePageVars {
  title?: string;
  slug?: string;
  body?: string;
  excerpt?: string | null;
  icon?: string | null;
  status?: PageStatus;
}

/** Renders Markdown to React nodes. The app owns sanitization (e.g. rehype-sanitize). */
export type RenderMarkdown = (markdown: string) => React.ReactNode;
