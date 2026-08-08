/**
 * @ccatto/nest-comments - configuration interfaces
 */

/** When a new comment becomes visible. */
export type ModerationMode = 'pre' | 'post';

/**
 * The resolved config injected as CATTO_COMMENTS_CONFIG (all defaults applied).
 */
export interface CattoCommentsConfig {
  /** Prisma model (delegate) name that stores comments. Default: 'comment'. */
  commentModel: string;
  /**
   * 'pre'  -> new comments start PENDING (hidden until an admin approves).
   * 'post' -> new comments start APPROVED (visible immediately, removable later).
   * Default 'pre' (safest for App Store / Play UGC).
   */
  moderationMode: ModerationMode;
  /** Max comment body length. Default 4000. */
  maxLength: number;
  /** Allow threaded replies (a non-null parentId). Default true. */
  allowReplies: boolean;
  /** When flaggedCount reaches this, the comment auto-hides. Default 3. */
  autoHideFlagThreshold: number;
  /**
   * Reserved. v1's GraphQL resolver always requires auth (guarded); apps that
   * want anonymous comments can call CattoCommentsService.create directly.
   * Default false.
   */
  allowAnonymous: boolean;
  /**
   * Profanity predicate — returns true when the text IS profane. Default:
   * `isProfane` from @ccatto/profanity. Enforced server-side (authoritative).
   */
  profanityCheck: (text: string) => boolean;
}

/** Options accepted by CattoCommentsModule.forRoot(). */
export interface CattoCommentsModuleOptions {
  /**
   * Provider token that resolves to the app's Prisma service or client.
   * The service accesses `prisma.client ?? prisma` then the comment model.
   */
  prismaToken: any;
  /** Prisma model name for comments. Default: 'comment'. */
  commentModel?: string;
  /** Moderation mode. Default 'pre'. */
  moderationMode?: ModerationMode;
  /** Max comment body length. Default 4000. */
  maxLength?: number;
  /** Allow threaded replies. Default true. */
  allowReplies?: boolean;
  /** Auto-hide a comment once flaggedCount reaches this. Default 3. */
  autoHideFlagThreshold?: number;
  /** Reserved (see CattoCommentsConfig.allowAnonymous). Default false. */
  allowAnonymous?: boolean;
  /**
   * Override the profanity predicate (returns true when profane). Defaults to
   * `isProfane` from @ccatto/profanity.
   */
  profanityCheck?: (text: string) => boolean;
}
