// @ccatto/react-comments — i18n label bags (override via the `labels` prop)

export interface CommentThreadLabels {
  heading: string;
  empty: string;
  signInToComment: string;
  placeholder: string;
  submit: string;
  submitting: string;
  reply: string;
  replyingTo: string; // "{name}" is replaced with the author name
  cancel: string;
  report: string;
  reported: string;
  block: string;
  pendingReview: string;
  profanityError: string;
  genericError: string;
  loadMore: string;
}

export const DEFAULT_THREAD_LABELS: CommentThreadLabels = {
  heading: 'Comments',
  empty: 'No comments yet. Be the first to comment.',
  signInToComment: 'Sign in to join the conversation.',
  placeholder: 'Write a comment…',
  submit: 'Post comment',
  submitting: 'Posting…',
  reply: 'Reply',
  replyingTo: 'Replying to {name}',
  cancel: 'Cancel',
  report: 'Report',
  reported: 'Reported',
  block: 'Block',
  pendingReview: 'Pending review',
  profanityError: 'Please remove inappropriate language before posting.',
  genericError: 'Something went wrong. Please try again.',
  loadMore: 'Load more',
};

export interface CommentModerationLabels {
  heading: string;
  empty: string;
  author: string;
  comment: string;
  flags: string;
  actions: string;
  approve: string;
  hide: string;
  remove: string;
  loading: string;
  genericError: string;
  loadMore: string;
}

export const DEFAULT_MODERATION_LABELS: CommentModerationLabels = {
  heading: 'Moderation queue',
  empty: 'Nothing to moderate. 🎉',
  author: 'Author',
  comment: 'Comment',
  flags: 'Flags',
  actions: 'Actions',
  approve: 'Approve',
  hide: 'Hide',
  remove: 'Remove',
  loading: 'Loading…',
  genericError: 'Something went wrong. Please try again.',
  loadMore: 'Load more',
};
