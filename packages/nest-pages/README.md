# @ccatto/nest-pages

A **page CMS** for NestJS apps — admin-authored, nested content pages (docs,
guides, knowledge bases) that render from your DB, with the site nav generated
from the page tree. Keyed by a generic `namespace` / `slug` / `parentId`, so any
app can host one or more page trees without a bespoke schema.

Mirrors `@ccatto/nest-comments`: you inject your app's Prisma and add the `Page`
model to your own `schema.prisma`. Admin mutations reuse `@ccatto/nest-auth`
guards — no reinvented auth. Pairs with the frontend `@ccatto/react-pages`.

> **Admin-authored content — no profanity/moderation here.** Pages are written by
> platform admins; user-generated content (comments) lives in
> `@ccatto/nest-comments`. Do still **sanitize the Markdown body when rendering**
> (the frontend does this) to guard against stored XSS.

## Install

```bash
yarn add @ccatto/nest-pages
```

Peers: `@nestjs/common`/`core`/`graphql` (>=12), `class-validator`,
`class-transformer`, `reflect-metadata`, **`@ccatto/nest-auth`** (its
`GqlAuthGuard` + `PlatformAdminGuard` guard the admin operations).

## Setup

### 1. Add the Prisma model (documented, app-added)

```prisma
enum PageStatus { DRAFT PUBLISHED }

model Page {
  id          String     @id @default(cuid())
  namespace   String     // scopes a tree, e.g. "pickle_talk"
  slug        String     // path segment, unique among siblings
  parentId    String?    // nesting; null = top level
  title       String
  body        String     // Markdown (rendered sanitized by the frontend)
  excerpt     String?
  icon        String?
  status      PageStatus @default(DRAFT)
  order       Int        @default(0)   // sibling order (drag-reorder)
  updatedById String?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@unique([namespace, parentId, slug])
  @@index([namespace, status])
  @@map("page")
}
```

### 2. Register the module

`CattoAuthModule` (from `@ccatto/nest-auth`) must also be registered.

```ts
import { CattoPagesModule } from '@ccatto/nest-pages';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [CattoPagesModule.forRoot({ prismaToken: PrismaService })],
})
export class AppModule {}
```

`forRoot` options: `prismaToken` (required), `pageModel` (`'page'`), `slugify`
(default provided), `deleteWithChildren` (`'reject'` default, or `'cascade'`).

## GraphQL API

| Operation | Auth | Notes |
| --- | --- | --- |
| `pageTree(namespace)` | public | nested tree, **PUBLISHED only**, ordered — powers the nav |
| `pageByPath(namespace, path)` | public | one page for rendering (PUBLISHED); `path` = `"a/b/c"` slug chain |
| `pagesForAdmin(namespace)` | admin | full tree incl. drafts + bodies (the editor loads from this) |
| `createPage(input)` | admin | auto-slugifies title when `slug` omitted |
| `updatePage(id, input)` | admin | slug only changes when explicitly provided |
| `deletePage(id)` | admin | reject (default) or cascade when it has children |
| `reorderPages(parentId, orderedIds)` | admin | persists sibling `order` |
| `movePage(id, newParentId)` | admin | re-parent (lands at end of the group) |

Admin = `@ccatto/nest-auth`'s `PlatformAdminGuard`. Public reads never return
drafts, so there's no optional-auth complexity — admins preview drafts via
`pagesForAdmin`. Every node carries a computed `path` (the full slug chain).

## Comments by page (with `@ccatto/nest-comments`)

Attach comments to a page with a **stable key** — use the page **`id`** (survives
renames/moves):

```
entityType: `${namespace}_page`   // e.g. "pickle_talk_page"
entityKey:  page.id
```

## License

MIT
