/**
 * @ccatto/nest-events - GraphQL DTOs
 */
import { Field, InputType, ObjectType, Int } from '@nestjs/graphql';
import { IsOptional, IsString, MaxLength } from 'class-validator';

@InputType()
export class LogEventInput {
  /** Event name, e.g. 'paddle_view', 'outbound_click'. */
  @Field()
  @IsString()
  @MaxLength(64)
  name!: string;

  /** Optional entity kind the event is about, e.g. 'paddle'. */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  entityType?: string;

  /** Optional entity id the event is about. */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  entityId?: string;

  /** Optional extra context as a JSON string (parsed + stored as JSON). */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  meta?: string;
}

@ObjectType()
export class EntityCount {
  @Field()
  entityId!: string;

  @Field(() => Int)
  count!: number;
}
