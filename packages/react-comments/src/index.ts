// @ccatto/react-comments
//
// Transport-agnostic comment thread + moderation UI for user-generated content.
// Pairs with @ccatto/nest-comments. Inject async data callbacks (wire them to
// your Apollo/fetch layer); this package ships no data client.

export { CommentThreadCatto } from './components/CommentThreadCatto';
export type { CommentThreadCattoProps } from './components/CommentThreadCatto';

export { CommentModerationTableCatto } from './components/CommentModerationTableCatto';
export type { CommentModerationTableCattoProps } from './components/CommentModerationTableCatto';

export { useCommentModeration } from './hooks/useCommentModeration';
export type {
  UseCommentModerationConfig,
  UseCommentModerationReturn,
} from './hooks/useCommentModeration';

export {
  DEFAULT_THREAD_LABELS,
  DEFAULT_MODERATION_LABELS,
} from './labels';
export type { CommentThreadLabels, CommentModerationLabels } from './labels';

export type {
  CommentDTO,
  CommentPage,
  CommentStatus,
  CommentUser,
  FetchCommentsVars,
  CreateCommentVars,
  CommentLinkComponent,
} from './types';
