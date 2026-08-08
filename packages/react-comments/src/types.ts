// @ccatto/react-comments — shared types
//
// Transport-agnostic: the app injects async data callbacks (wire them to Apollo,
// fetch, tRPC, whatever). Mirrors @ccatto/react-contact's callback approach.
import type React from 'react';

export type CommentStatus = 'PENDING' | 'APPROVED' | 'HIDDEN' | 'REMOVED';

/** A comment as returned by your GraphQL/API (shape of `@ccatto/nest-comments`). */
export interface CommentDTO {
  id: string;
  entityType: string;
  entityKey: string;
  authorId: string;
  authorName?: string | null;
  body: string;
  status: CommentStatus;
  parentId?: string | null;
  flaggedCount: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CommentPage {
  total: number;
  items: CommentDTO[];
}

/** The signed-in user, as your app knows them. */
export interface CommentUser {
  id: string;
  name?: string | null;
  role?: string | null;
}

export interface FetchCommentsVars {
  entityType: string;
  entityKey: string;
  take?: number;
  skip?: number;
}

export interface CreateCommentVars {
  entityType: string;
  entityKey: string;
  body: string;
  parentId?: string;
}

/** Router link component (e.g. next/link), matching other @ccatto components. */
export type CommentLinkComponent = React.ComponentType<{
  href: string;
  className?: string;
  children: React.ReactNode;
}>;
