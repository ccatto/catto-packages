# Changelog

All notable changes to `@ccatto/nest-pages` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-08-08

### Added

- Initial release. A page CMS module for NestJS: admin-authored, nested content
  pages keyed by a generic `namespace`/`slug`/`parentId`.
- `CattoPagesModule.forRoot({ prismaToken, pageModel, slugify, deleteWithChildren })`
  — injects the app's Prisma; documents a `Page` model + `PageStatus` enum to add
  to `schema.prisma`.
- `CattoPagesService` — nested tree build with computed paths, slug-path
  resolution, create/update/delete (reject or cascade with children), sibling
  reorder, and move/re-parent; auto-slugify + unique-per-sibling enforcement.
- GraphQL resolver reusing `@ccatto/nest-auth` guards: public `pageTree` +
  `pageByPath` (PUBLISHED only), admin `pagesForAdmin` + `createPage`/
  `updatePage`/`deletePage`/`reorderPages`/`movePage`.
- Exports `defaultSlugify` and the `PageNode`/`PageStatus` GraphQL types.
