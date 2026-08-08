# Changelog

All notable changes to `@ccatto/react-comments` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-08-08

### Added

- Initial release. Transport-agnostic comment thread + moderation UI, pairing
  with `@ccatto/nest-comments`.
- **`<CommentThreadCatto>`** — approved comments + a submit form; client-side
  profanity pre-check (`profanityCheck` prop); optimistic "pending review" pill
  in `moderationMode='pre'`; sign-in / empty states; report + block affordances;
  one-level threaded replies.
- **`<CommentModerationTableCatto>`** + **`useCommentModeration`** — admin queue
  with inline approve / hide / remove (optimistic).
- Overridable i18n via `labels` (`DEFAULT_THREAD_LABELS` /
  `DEFAULT_MODERATION_LABELS`).
