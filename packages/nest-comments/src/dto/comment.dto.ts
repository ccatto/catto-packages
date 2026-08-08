/**
 * @ccatto/nest-comments - GraphQL DTOs
 */
import {
  Field,
  InputType,
  ObjectType,
  Int,
  registerEnumType,
  ID,
} from '@nestjs/graphql';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/** Lifecycle status of a comment. */
export enum CommentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  HIDDEN = 'HIDDEN',
  REMOVED = 'REMOVED',
}

registerEnumType(CommentStatus, {
  name: 'CommentStatus',
  description: 'Lifecycle status of a comment',
});

@InputType()
export class CreateCommentInput {
  /** Entity kind the comment attaches to, e.g. 'pickle_talk_page'. */
  @Field()
  @IsString()
  @MaxLength(64)
  entityType!: string;

  /** Entity key (slug / record id) in the consuming app. */
  @Field()
  @IsString()
  @MaxLength(191)
  entityKey!: string;

  /** The comment body. Profanity is rejected server-side by the service. */
  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  body!: string;

  /** Optional parent comment id for a threaded reply. */
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  parentId?: string;
}

@ObjectType()
export class CommentType {
  @Field(() => ID)
  id!: string;

  @Field()
  entityType!: string;

  @Field()
  entityKey!: string;

  @Field()
  authorId!: string;

  @Field({ nullable: true })
  authorName?: string;

  @Field()
  body!: string;

  @Field(() => CommentStatus)
  status!: CommentStatus;

  @Field(() => ID, { nullable: true })
  parentId?: string;

  @Field(() => Int)
  flaggedCount!: number;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

@ObjectType()
export class CommentPage {
  @Field(() => Int)
  total!: number;

  @Field(() => [CommentType])
  items!: CommentType[];
}
