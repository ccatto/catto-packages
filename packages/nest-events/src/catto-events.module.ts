/**
 * @ccatto/nest-events - CattoEventsModule
 *
 * Dynamic NestJS module for in-house event logging to your own DB.
 *
 * ## Usage
 *
 * ```typescript
 * import { CattoEventsModule } from '@ccatto/nest-events';
 * import { PrismaService } from './prisma/prisma.service';
 *
 * @Module({
 *   imports: [
 *     CattoEventsModule.forRoot({ prismaToken: PrismaService }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * Your Prisma schema needs an event model (default name `appEvent`):
 *
 * ```prisma
 * model AppEvent {
 *   id         String   @id @default(cuid())
 *   name       String
 *   entityType String?
 *   entityId   String?
 *   userId     String?
 *   meta       Json?
 *   createdAt  DateTime @default(now())
 *   @@index([name, entityType, entityId])
 *   @@index([createdAt])
 *   @@map("app_event")
 * }
 * ```
 */
import { Module, DynamicModule } from '@nestjs/common';
import { CATTO_EVENTS_CONFIG, CATTO_EVENTS_PRISMA } from './constants';
import { CattoEventsModuleOptions } from './interfaces/config.interfaces';
import { EventsService } from './events.service';
import { EventsResolver } from './events.resolver';

@Module({})
export class CattoEventsModule {
  static forRoot(options: CattoEventsModuleOptions): DynamicModule {
    if (!options.prismaToken) {
      throw new Error(
        '@ccatto/nest-events: prismaToken is required in CattoEventsModule.forRoot()',
      );
    }

    return {
      module: CattoEventsModule,
      global: true,
      providers: [
        {
          provide: CATTO_EVENTS_CONFIG,
          useValue: { eventModel: options.eventModel ?? 'appEvent' },
        },
        { provide: CATTO_EVENTS_PRISMA, useExisting: options.prismaToken },
        EventsService,
        EventsResolver,
      ],
      exports: [EventsService],
    };
  }
}
