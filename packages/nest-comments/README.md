# @ccatto/nest-comments

Moderated **comments** for NestJS apps — a profanity filter (server-authoritative),
admin moderation, report/flag, and a moderation status — keyed by a generic
`entityType` / `entityKey` so any page/article in any app can host comments
without a shared "Article" table. Built to keep user-generated content from
jeopardizing **App Store / Google Play** eligibility.

Mirrors `@ccatto/nest-events`: you inject your app's Prisma and add the model to
your own `schema.prisma`. Reuses `@ccatto/nest-auth` guards for auth/moderation —
no reinvented auth. Pairs with the frontend `@ccatto/react-comments`.

## Install

```bash
yarn add @ccatto/nest-comments
```

Peers: `@nestjs/common`, `@nestjs/core`, `@nestjs/graphql` (>=12),
`class-validator`, `class-transformer`, `reflect-metadata`, **`@ccatto/nest-auth`**
(the resolver reuses its `GqlAuthGuard` + `PlatformAdminGuard`), and
**`@ccatto/profanity`** (the server-side filter).

## Setup

### 1. Add the Prisma model

The model is **documented, not shipped** (the `nest-events`/`AppEvent` pattern) —
add it to your app's `schema.prisma` (default delegate name `comment`):

```prisma
enum CommentStatus { PENDING APPROVED HIDDEN REMOVED }

model Comment {
  id           String        @id @default(cuid())
  entityType   String        // e.g. "pickle_talk_page", "paddle", "blog_post"
  entityKey    String        // the page slug / record id in your app
  authorId     String        // your app's user id
  authorName   String?       // denormalized display name at post time
  body         String
  status       CommentStatus @default(PENDING)
  parentId     String?       // optional threaded replies
  flaggedCount Int           @default(0)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  @@index([entityType, entityKey, status])
  @@map("comment")
}
```

### 2. Register the module

`CattoAuthModule` (from `@ccatto/nest-auth`) must also be registered — the
resolver reuses its guards, which read the current user + the configured admin
role.

```ts
import { CattoCommentsModule } from '@ccatto/nest-comments';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    // CattoAuthModule.forRoot({ ... }) already registered
    CattoCommentsModule.forRoot({
      prismaToken: PrismaService,
      moderationMode: 'pre', // default — hide new comments until approved
    }),
  ],
})
export class AppModule {}
```

### Config (`forRoot`)

| Option | Default | Notes |
| --- | --- | --- |
| `prismaToken` | — | Provider token for your Prisma service (required) |
| `commentModel` | `'comment'` | Prisma delegate name |
| `moderationMode` | `'pre'` | `'pre'` → `PENDING` until approved; `'post'` → `APPROVED` immediately |
| `maxLength` | `4000` | Max body length |
| `allowReplies` | `true` | Allow a non-null `parentId` |
| `autoHideFlagThreshold` | `3` | `flaggedCount` at which an APPROVED comment auto-hides |
| `allowAnonymous` | `false` | Reserved — v1's resolver always requires auth (call the service directly for anonymous) |
| `profanityCheck` | `isProfane` | Override the profanity predicate |

## GraphQL API

| Operation | Auth | Notes |
| --- | --- | --- |
| `commentsByEntity(entityType, entityKey, take?, skip?)` | public | **APPROVED only** |
| `commentsForModeration(status?, entityType?, entityKey?, take?, skip?)` | admin | moderation queue (default `PENDING`) |
| `createComment(input)` | signed-in | profanity-gated; status from `moderationMode` |
| `moderateComment(id, status)` | admin | approve / hide / remove |
| `reportComment(id)` | signed-in | increments `flaggedCount`; auto-hides past threshold |

Admin = `@ccatto/nest-auth`'s `PlatformAdminGuard` (the role you configured in
`CattoAuthModule`, default `platform_admin`). Rate-limiting is expected from your
app's **global throttler**; wrap the exported `CattoCommentsService` in your own
resolver with `@Throttle` for tighter per-mutation limits.

## App Store / Play safety ⚠️

Apple Guideline 1.2 and Google Play UGC policy expect apps with user content to
provide: a **content filter**, a **report/flag** mechanism, the ability to
**block** abusive users, and **moderator removal**. This package provides the
**filter + report + moderation + status**; your app must additionally:

- Keep `moderationMode: 'pre'` (or actively moderate `'post'`) **before shipping UGC**.
- Wire a **report** button (calls `reportComment`) and a **moderation** surface
  (`commentsForModeration` + `moderateComment`) — the frontend
  `@ccatto/react-comments` provides both.
- Wire **block-user** to your own block system (this package intentionally
  doesn't own user blocking).

Profanity is enforced **server-side** (authoritative) via `@ccatto/profanity`;
any client-side check is convenience only.

## License

MIT
