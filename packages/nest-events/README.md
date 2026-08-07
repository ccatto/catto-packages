# @ccatto/nest-events

In-house event / analytics logging for NestJS apps. Writes events to **your own
database** via the app's Prisma service — no third-party analytics SDK, no data
leaving your infra. Exposes an `EventsService` for server-side recording plus a
GraphQL `logEvent` mutation and `topEntities` query.

Distinct from `@ccatto/logger` (which is Pino console/structured logging). This
package is for durable, queryable product events ("viewed paddle X", "clicked
buy") that power rankings like "most viewed".

## Install

```bash
yarn add @ccatto/nest-events
```

Peer deps: `@nestjs/common`, `@nestjs/core`, `@nestjs/graphql` (>=12),
`class-transformer`, `class-validator`, `reflect-metadata`.

## Setup

### 1. Add an event model to your Prisma schema

```prisma
model AppEvent {
  id         String   @id @default(cuid())
  name       String                 // e.g. "paddle_viewed"
  entityType String?                // e.g. "paddle"
  entityId   String?                // e.g. the paddle id
  userId     String?
  meta       Json?
  createdAt  DateTime @default(now())

  @@index([entityType, name, createdAt])
}
```

### 2. Register the module

Pass the provider token for your app's Prisma service. The default event model
name is `appEvent` — override with `eventModel` if yours differs.

```ts
import { CattoEventsModule } from '@ccatto/nest-events';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    CattoEventsModule.forRoot({
      prismaToken: PrismaService,
      eventModel: 'appEvent', // optional, this is the default
    }),
  ],
})
export class AppModule {}
```

The service resolves the delegate as `prisma.client ?? prisma` then
`[eventModel]`, so it works with both raw `PrismaClient` and wrapper services.

## Usage

### Record events server-side

Inject `EventsService` anywhere. `record()` **never throws** — analytics must
not break the request path (failures are logged as warnings).

```ts
import { EventsService } from '@ccatto/nest-events';

@Injectable()
export class PaddlesService {
  constructor(private readonly events: EventsService) {}

  async view(paddleId: string, userId?: string) {
    await this.events.record({
      name: 'paddle_viewed',
      entityType: 'paddle',
      entityId: paddleId,
      userId,
      meta: { source: 'search' },
    });
  }
}
```

### Rankings

```ts
// Top paddle ids by "paddle_viewed" in the last 30 days.
const top = await this.events.topEntities('paddle', 'paddle_viewed', 30, 12);
// -> [{ entityId, count }, ...]
```

### GraphQL

Registering the module also wires a resolver:

```graphql
mutation { logEvent(input: { name: "paddle_viewed", entityType: "paddle", entityId: "abc" }) }
query   { topEntities(entityType: "paddle", name: "paddle_viewed") { entityId count } }
```

## Exports

`CattoEventsModule`, `EventsService` (+ `RecordEventData`), `EventsResolver`,
`LogEventInput`, `EntityCount`, and the config interfaces/constants.

## License

MIT
