# Changelog

All notable changes to `@ccatto/nest-pages` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-08-08

### Fixed

- **Schema-build crash on boot.** `PageNode.excerpt` and `PageNode.icon` were
  typed `string | null`, which NestJS code-first can't infer (`UndefinedTypeError:
  … explicit type for the "excerpt" of the "PageNode" class`), crashing schema
  generation when the module is registered. Every optional field now declares an
  explicit `@Field(() => Type, { nullable: true })`. Added a `GraphQLSchemaFactory`
  smoke test (`pages.schema.spec.ts`) that builds the schema from the resolver, so
  a missing field type fails CI rather than the consuming app at runtime
  (publint/attw can't catch a runtime schema-build error).

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
