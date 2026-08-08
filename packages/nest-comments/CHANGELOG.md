# Changelog

All notable changes to `@ccatto/nest-comments` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-08-08

### Added

- Initial release. Moderated comments module for NestJS, keyed by a generic
  `entityType`/`entityKey`.
- `CattoCommentsModule.forRoot({ prismaToken, moderationMode, ... })` — injects
  the app's Prisma; documents a `Comment` model + `CommentStatus` enum to add to
  `schema.prisma`.
- `CattoCommentsService` — server-authoritative profanity gate (via
  `@ccatto/profanity`), moderation status from `moderationMode` (`'pre'`→PENDING,
  `'post'`→APPROVED), report/flag with auto-hide threshold.
- GraphQL resolver reusing `@ccatto/nest-auth` guards: public `commentsByEntity`
  (APPROVED only), admin `commentsForModeration` + `moderateComment`, signed-in
  `createComment` + `reportComment`.
- README documents the Prisma model and the App Store / Play UGC-safety story.
