/**
 * @ccatto/nest-comments - CattoCommentsService
 *
 * Holds the moderation logic: profanity is a hard, server-authoritative gate
 * (reject on match); everything that passes gets a status from `moderationMode`
 * ('pre' -> PENDING, 'post' -> APPROVED). Reads are safe (never throw); writes
 * throw BadRequest on rejection so the caller sees a clear error.
 */
import {
  Injectable,
  Inject,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CATTO_COMMENTS_CONFIG, CATTO_COMMENTS_PRISMA } from './constants';
import { CattoCommentsConfig } from './interfaces/config.interfaces';
import { CommentStatus } from './dto/comment.dto';

export interface CreateCommentData {
  entityType: string;
  entityKey: string;
  /** The comment author's id (the app's user id). */
  authorId: string;
  /** Denormalized display name captured at post time (optional). */
  authorName?: string | null;
  body: string;
  parentId?: string | null;
}

export interface ListCommentsOptions {
  /** Filter by status. Non-admin callers are always forced to APPROVED. */
  status?: CommentStatus;
  take?: number;
  skip?: number;
  /** When true, `status` is honored (used by the moderation surface). */
  viewerIsAdmin?: boolean;
}

@Injectable()
export class CattoCommentsService {
  private readonly logger = new Logger(CattoCommentsService.name);

  constructor(
    @Inject(CATTO_COMMENTS_CONFIG) private readonly config: CattoCommentsConfig,
    @Inject(CATTO_COMMENTS_PRISMA) private readonly prisma: any,
  ) {}

  /** Prisma delegate for the comment model (supports `prisma.client` wrappers). */
  private get model(): any {
    const client = this.prisma?.client ?? this.prisma;
    return client?.[this.config.commentModel];
  }

  /**
   * List comments for an entity. Non-admins only ever see APPROVED; admins may
   * pass any `status` (default when admin: no status filter).
   */
  async listByEntity(
    entityType: string,
    entityKey: string,
    options: ListCommentsOptions = {},
  ): Promise<{ total: number; items: any[] }> {
    const take = Math.min(Math.max(options.take ?? 50, 1), 100);
    const skip = Math.max(options.skip ?? 0, 0);

    const where: Record<string, unknown> = { entityType, entityKey };
    if (options.viewerIsAdmin) {
      if (options.status) where.status = options.status;
    } else {
      where.status = CommentStatus.APPROVED;
    }

    try {
      const [total, items] = await Promise.all([
        this.model.count({ where }),
        this.model.findMany({
          where,
          orderBy: { createdAt: 'asc' },
          take,
          skip,
        }),
      ]);
      return { total, items };
    } catch (err) {
      this.logger.warn(
        `listByEntity failed: ${err instanceof Error ? err.message : String(err)}`,
      );
      return { total: 0, items: [] };
    }
  }

  /**
   * List comments needing attention (moderation surface). Admin-only — the
   * resolver guards this; the service just runs the query.
   */
  async listForModeration(
    options: {
      status?: CommentStatus;
      entityType?: string;
      entityKey?: string;
      take?: number;
      skip?: number;
    } = {},
  ): Promise<{ total: number; items: any[] }> {
    const take = Math.min(Math.max(options.take ?? 50, 1), 100);
    const skip = Math.max(options.skip ?? 0, 0);

    const where: Record<string, unknown> = {
      status: options.status ?? CommentStatus.PENDING,
    };
    if (options.entityType) where.entityType = options.entityType;
    if (options.entityKey) where.entityKey = options.entityKey;

    try {
      const [total, items] = await Promise.all([
        this.model.count({ where }),
        this.model.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take,
          skip,
        }),
      ]);
      return { total, items };
    } catch (err) {
      this.logger.warn(
        `listForModeration failed: ${err instanceof Error ? err.message : String(err)}`,
      );
      return { total: 0, items: [] };
    }
  }

  /**
   * Create a comment. Rejects (throws BadRequest) empty/oversized bodies,
   * profanity, and replies when disabled. Sets initial status from
   * `moderationMode`.
   */
  async create(data: CreateCommentData): Promise<any> {
    const body = (data.body ?? '').trim();

    if (!body) {
      throw new BadRequestException('Comment cannot be empty');
    }
    if (body.length > this.config.maxLength) {
      throw new BadRequestException(
        `Comment exceeds the ${this.config.maxLength}-character limit`,
      );
    }
    if (data.parentId && !this.config.allowReplies) {
      throw new BadRequestException('Replies are not allowed');
    }
    if (this.config.profanityCheck(body)) {
      throw new BadRequestException(
        'Your comment contains inappropriate language',
      );
    }

    const status =
      this.config.moderationMode === 'post'
        ? CommentStatus.APPROVED
        : CommentStatus.PENDING;

    return this.model.create({
      data: {
        entityType: data.entityType,
        entityKey: data.entityKey,
        authorId: data.authorId,
        authorName: data.authorName ?? null,
        body,
        status,
        parentId: data.parentId ?? null,
        flaggedCount: 0,
      },
    });
  }

  /** Set a comment's status (approve / hide / remove). Admin-guarded upstream. */
  async moderate(id: string, status: CommentStatus): Promise<any> {
    try {
      return await this.model.update({ where: { id }, data: { status } });
    } catch {
      throw new NotFoundException('Comment not found');
    }
  }

  /**
   * Report a comment: increments flaggedCount and auto-hides once it reaches
   * `autoHideFlagThreshold` (an APPROVED comment becomes HIDDEN pending review).
   */
  async report(id: string): Promise<any> {
    let comment: any;
    try {
      comment = await this.model.update({
        where: { id },
        data: { flaggedCount: { increment: 1 } },
      });
    } catch {
      throw new NotFoundException('Comment not found');
    }

    if (
      comment.flaggedCount >= this.config.autoHideFlagThreshold &&
      comment.status === CommentStatus.APPROVED
    ) {
      comment = await this.model.update({
        where: { id },
        data: { status: CommentStatus.HIDDEN },
      });
    }
    return comment;
  }
}
