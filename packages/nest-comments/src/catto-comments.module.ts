/**
 * @ccatto/nest-comments - CattoCommentsModule
 *
 * Moderated comments (profanity filter + admin moderation + report/flag) for
 * user-generated content, keyed by a generic entityType/entityKey so any
 * page/article in any app can host comments.
 *
 * ## Usage
 *
 * ```typescript
 * import { CattoCommentsModule } from '@ccatto/nest-comments';
 * import { PrismaService } from './prisma/prisma.service';
 *
 * @Module({
 *   imports: [
 *     // CattoAuthModule.forRoot({...}) must also be registered — the resolver
 *     // reuses its GqlAuthGuard + PlatformAdminGuard.
 *     CattoCommentsModule.forRoot({
 *       prismaToken: PrismaService,
 *       moderationMode: 'pre', // hide new comments until an admin approves
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * Your Prisma schema needs a comment model (default name `comment`):
 *
 * ```prisma
 * enum CommentStatus { PENDING APPROVED HIDDEN REMOVED }
 *
 * model Comment {
 *   id           String        @id @default(cuid())
 *   entityType   String
 *   entityKey    String
 *   authorId     String
 *   authorName   String?
 *   body         String
 *   status       CommentStatus @default(PENDING)
 *   parentId     String?
 *   flaggedCount Int           @default(0)
 *   createdAt    DateTime      @default(now())
 *   updatedAt    DateTime      @updatedAt
 *   @@index([entityType, entityKey, status])
 *   @@map("comment")
 * }
 * ```
 */
import { Module, DynamicModule } from '@nestjs/common';
import { isProfane } from '@ccatto/profanity';
import { CATTO_COMMENTS_CONFIG, CATTO_COMMENTS_PRISMA } from './constants';
import {
  CattoCommentsConfig,
  CattoCommentsModuleOptions,
} from './interfaces/config.interfaces';
import { CattoCommentsService } from './comments.service';
import { CommentsResolver } from './comments.resolver';

@Module({})
export class CattoCommentsModule {
  static forRoot(options: CattoCommentsModuleOptions): DynamicModule {
    if (!options.prismaToken) {
      throw new Error(
        '@ccatto/nest-comments: prismaToken is required in CattoCommentsModule.forRoot()',
      );
    }

    const config: CattoCommentsConfig = {
      commentModel: options.commentModel ?? 'comment',
      moderationMode: options.moderationMode ?? 'pre',
      maxLength: options.maxLength ?? 4000,
      allowReplies: options.allowReplies ?? true,
      autoHideFlagThreshold: options.autoHideFlagThreshold ?? 3,
      allowAnonymous: options.allowAnonymous ?? false,
      profanityCheck: options.profanityCheck ?? isProfane,
    };

    return {
      module: CattoCommentsModule,
      global: true,
      providers: [
        { provide: CATTO_COMMENTS_CONFIG, useValue: config },
        { provide: CATTO_COMMENTS_PRISMA, useExisting: options.prismaToken },
        CattoCommentsService,
        CommentsResolver,
      ],
      exports: [CattoCommentsService],
    };
  }
}
