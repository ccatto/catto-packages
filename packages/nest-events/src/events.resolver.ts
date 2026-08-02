/**
 * @ccatto/nest-events - EventsResolver
 *
 * Public GraphQL surface. `logEvent` is intentionally anonymous (no auth guard,
 * no userId captured here) so it can record views/clicks from any visitor while
 * staying "App Functionality" and not identity-linked tracking. Apps that want
 * user-linked events can call EventsService.record directly with a userId.
 */
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { EventsService } from './events.service';
import { EntityCount, LogEventInput } from './dto/event.dto';

@Resolver()
export class EventsResolver {
  constructor(private readonly events: EventsService) {}

  @Mutation(() => Boolean)
  async logEvent(@Args('input') input: LogEventInput): Promise<boolean> {
    let meta: unknown;
    if (input.meta) {
      try {
        meta = JSON.parse(input.meta);
      } catch {
        meta = { raw: input.meta };
      }
    }
    await this.events.record({
      name: input.name,
      entityType: input.entityType,
      entityId: input.entityId,
      meta,
    });
    return true;
  }

  @Query(() => [EntityCount])
  async topEntities(
    @Args('entityType') entityType: string,
    @Args('name') name: string,
    @Args('sinceDays', { type: () => Int, nullable: true }) sinceDays?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<EntityCount[]> {
    return this.events.topEntities(
      entityType,
      name,
      sinceDays ?? 30,
      limit ?? 12,
    );
  }
}
