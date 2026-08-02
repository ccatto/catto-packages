/**
 * @ccatto/nest-events
 *
 * In-house event / analytics logging for NestJS apps — writes to your own DB via
 * the app's Prisma, exposes a public `logEvent` mutation + `topEntities` query.
 * No third-party analytics SDK. Distinct from @ccatto/logger (Pino console logs).
 */
export * from './constants';
export * from './interfaces/config.interfaces';
export * from './catto-events.module';
export { EventsService } from './events.service';
export type { RecordEventData } from './events.service';
export { EventsResolver } from './events.resolver';
export { LogEventInput, EntityCount } from './dto/event.dto';
