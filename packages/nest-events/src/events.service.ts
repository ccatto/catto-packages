/**
 * @ccatto/nest-events - EventsService
 *
 * Writes product events to the app's own DB (via the injected Prisma) and reads
 * simple aggregates. Recording is fire-and-forget safe: it never throws to the
 * caller, so a logging hiccup can't break a user action.
 */
import { Injectable, Inject, Logger } from '@nestjs/common';
import { CATTO_EVENTS_CONFIG, CATTO_EVENTS_PRISMA } from './constants';
import { CattoEventsConfig } from './interfaces/config.interfaces';

export interface RecordEventData {
  name: string;
  entityType?: string | null;
  entityId?: string | null;
  userId?: string | null;
  meta?: unknown;
}

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @Inject(CATTO_EVENTS_CONFIG) private readonly config: CattoEventsConfig,
    @Inject(CATTO_EVENTS_PRISMA) private readonly prisma: any,
  ) {}

  /** The Prisma delegate for the event model (supports `prisma.client` wrappers). */
  private get model(): any {
    const client = this.prisma?.client ?? this.prisma;
    return client?.[this.config.eventModel];
  }

  /** Record an event. Never throws — logging must not break the caller. */
  async record(data: RecordEventData): Promise<void> {
    try {
      await this.model.create({
        data: {
          name: data.name,
          entityType: data.entityType ?? null,
          entityId: data.entityId ?? null,
          userId: data.userId ?? null,
          meta: (data.meta ?? undefined) as any,
        },
      });
    } catch (err) {
      this.logger.warn(
        `Failed to record event "${data.name}": ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }

  /**
   * Top entity ids by event count within the last `sinceDays` days.
   * Powers "most viewed" style rankings.
   */
  async topEntities(
    entityType: string,
    name: string,
    sinceDays = 30,
    limit = 12,
  ): Promise<Array<{ entityId: string; count: number }>> {
    try {
      const since = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000);
      const rows = await this.model.groupBy({
        by: ['entityId'],
        where: {
          entityType,
          name,
          entityId: { not: null },
          createdAt: { gte: since },
        },
        _count: { entityId: true },
        orderBy: { _count: { entityId: 'desc' } },
        take: limit,
      });
      return rows
        .filter((r: any) => r.entityId)
        .map((r: any) => ({
          entityId: r.entityId as string,
          count: r._count.entityId as number,
        }));
    } catch (err) {
      this.logger.warn(
        `topEntities failed: ${err instanceof Error ? err.message : String(err)}`,
      );
      return [];
    }
  }
}
