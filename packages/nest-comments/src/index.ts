/**
 * @ccatto/nest-comments
 *
 * Moderated comments for NestJS apps — profanity filter (server-authoritative)
 * + admin moderation + report/flag + moderation status, keyed by a generic
 * entityType/entityKey. Reuses @ccatto/nest-auth guards; writes to your own DB
 * via the app's Prisma. Built for App Store / Play UGC safety.
 */
export * from './constants';
export * from './interfaces/config.interfaces';
export * from './catto-comments.module';
export { CattoCommentsService } from './comments.service';
export type {
  CreateCommentData,
  ListCommentsOptions,
} from './comments.service';
export { CommentsResolver } from './comments.resolver';
export {
  CommentStatus,
  CreateCommentInput,
  CommentType,
  CommentPage,
} from './dto/comment.dto';
