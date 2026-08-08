/**
 * @ccatto/nest-comments - CommentsResolver
 *
 * GraphQL surface. Auth reuses @ccatto/nest-auth guards (no reinvented auth):
 *  - createComment / reportComment require a signed-in user (GqlAuthGuard).
 *  - moderateComment + the moderation list require an admin (PlatformAdminGuard,
 *    which honors the admin role configured in CattoAuthModule).
 *  - commentsByEntity is public and only ever returns APPROVED comments.
 *
 * Rate-limiting is expected from the app's global throttler (e.g. pickle's
 * GraphqlThrottlerGuard). Apps wanting tighter per-mutation limits can wrap the
 * exported CattoCommentsService in their own resolver with @Throttle.
 */
import { Inject, UseGuards } from '@nestjs/common';
import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  GqlAuthGuard,
  PlatformAdminGuard,
  CurrentUser,
  TokenUser,
} from '@ccatto/nest-auth';
import { CattoCommentsService } from './comments.service';
import { CATTO_COMMENTS_CONFIG } from './constants';
import { CattoCommentsConfig } from './interfaces/config.interfaces';
import {
  CommentPage,
  CommentStatus,
  CommentType,
  CreateCommentInput,
} from './dto/comment.dto';

@Resolver(() => CommentType)
export class CommentsResolver {
  constructor(
    private readonly comments: CattoCommentsService,
    @Inject(CATTO_COMMENTS_CONFIG) private readonly config: CattoCommentsConfig,
  ) {}

  /** Public: approved comments for an entity/page. */
  @Query(() => CommentPage)
  async commentsByEntity(
    @Args('entityType') entityType: string,
    @Args('entityKey') entityKey: string,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
  ): Promise<CommentPage> {
    return this.comments.listByEntity(entityType, entityKey, {
      take,
      skip,
      viewerIsAdmin: false,
    });
  }

  /** Admin-only: the moderation queue (defaults to PENDING). */
  @Query(() => CommentPage)
  @UseGuards(GqlAuthGuard, PlatformAdminGuard)
  async commentsForModeration(
    @Args('status', { type: () => CommentStatus, nullable: true })
    status?: CommentStatus,
    @Args('entityType', { nullable: true }) entityType?: string,
    @Args('entityKey', { nullable: true }) entityKey?: string,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
  ): Promise<CommentPage> {
    return this.comments.listForModeration({
      status,
      entityType,
      entityKey,
      take,
      skip,
    });
  }

  /** Signed-in users post a comment (status set by moderationMode). */
  @Mutation(() => CommentType)
  @UseGuards(GqlAuthGuard)
  async createComment(
    @Args('input') input: CreateCommentInput,
    @CurrentUser() user: TokenUser,
  ): Promise<CommentType> {
    const authorName =
      typeof (user as { name?: unknown }).name === 'string'
        ? ((user as { name?: string }).name as string)
        : undefined;
    return this.comments.create({
      entityType: input.entityType,
      entityKey: input.entityKey,
      authorId: user.userId,
      authorName,
      body: input.body,
      parentId: input.parentId,
    });
  }

  /** Admin: approve / hide / remove a comment. */
  @Mutation(() => CommentType)
  @UseGuards(GqlAuthGuard, PlatformAdminGuard)
  async moderateComment(
    @Args('id', { type: () => ID }) id: string,
    @Args('status', { type: () => CommentStatus }) status: CommentStatus,
  ): Promise<CommentType> {
    return this.comments.moderate(id, status);
  }

  /** Signed-in users flag a comment; auto-hides past the flag threshold. */
  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async reportComment(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    await this.comments.report(id);
    return true;
  }
}
