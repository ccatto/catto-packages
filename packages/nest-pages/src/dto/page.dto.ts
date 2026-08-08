/**
 * @ccatto/nest-pages - GraphQL DTOs
 *
 * Every optional field carries an EXPLICIT `@Field(() => Type, ...)` — NestJS
 * code-first can't infer the GraphQL type from a `string | null` union (TS
 * reflection emits `Object`), which crashes schema build with UndefinedTypeError.
 * The `pages.schema.spec.ts` smoke test guards this at CI time.
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

  @Field(() => String)
  namespace!: string;

  @Field(() => String)
  slug!: string;

  @Field(() => ID, { nullable: true })
  parentId?: string | null;

  @Field(() => String)
  title!: string;

  @Field(() => String, { nullable: true })
  excerpt?: string | null;

  @Field(() => String, { nullable: true })
  icon?: string | null;

  @Field(() => PageStatus)
  status!: PageStatus;

  @Field(() => Int)
  order!: number;

  @Field(() => String)
  body!: string;

  /** Full slug path from the namespace root, e.g. "training/shots/forehand". */
  @Field(() => String)
  path!: string;

  /** Child pages (ordered). Empty for leaves. */
  @Field(() => [PageNode])
  children!: PageNode[];
}

@InputType()
export class CreatePageInput {
  @Field(() => String)
  @IsString()
  @MaxLength(64)
  namespace!: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  parentId?: string;

  @Field(() => String)
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title!: string;

  /** Optional — auto-slugified from `title` when omitted. */
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  slug?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  body?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  @Field(() => String, { nullable: true })
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
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  slug?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  body?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  icon?: string;

  @Field(() => PageStatus, { nullable: true })
  @IsOptional()
  @IsIn([PageStatus.DRAFT, PageStatus.PUBLISHED])
  status?: PageStatus;
}
