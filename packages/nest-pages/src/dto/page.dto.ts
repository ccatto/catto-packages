/**
 * @ccatto/nest-pages - GraphQL DTOs
 */
import {
  Field,
  ID,
  InputType,
  Int,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

/** Draft = hidden from the public; Published = live. */
export enum PageStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

registerEnumType(PageStatus, {
  name: 'PageStatus',
  description: 'Publish state of a content page',
});

@ObjectType()
export class PageNode {
  @Field(() => ID)
  id!: string;

  @Field()
  namespace!: string;

  @Field()
  slug!: string;

  @Field(() => ID, { nullable: true })
  parentId?: string | null;

  @Field()
  title!: string;

  @Field({ nullable: true })
  excerpt?: string | null;

  @Field({ nullable: true })
  icon?: string | null;

  @Field(() => PageStatus)
  status!: PageStatus;

  @Field(() => Int)
  order!: number;

  @Field()
  body!: string;

  /** Full slug path from the namespace root, e.g. "training/shots/forehand". */
  @Field()
  path!: string;

  /** Child pages (ordered). Empty for leaves. */
  @Field(() => [PageNode])
  children!: PageNode[];
}

@InputType()
export class CreatePageInput {
  @Field()
  @IsString()
  @MaxLength(64)
  namespace!: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  parentId?: string;

  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title!: string;

  /** Optional — auto-slugified from `title` when omitted. */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  slug?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  body?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  icon?: string;

  @Field(() => PageStatus, { nullable: true })
  @IsOptional()
  @IsIn([PageStatus.DRAFT, PageStatus.PUBLISHED])
  status?: PageStatus;
}

@InputType()
export class UpdatePageInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  slug?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  body?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  icon?: string;

  @Field(() => PageStatus, { nullable: true })
  @IsOptional()
  @IsIn([PageStatus.DRAFT, PageStatus.PUBLISHED])
  status?: PageStatus;
}
