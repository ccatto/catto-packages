/**
 * @ccatto/nest-events - configuration interfaces
 */

export interface CattoEventsConfig {
  /**
   * The Prisma model (delegate) name that stores events, e.g. 'appEvent'.
   * Defaults to 'appEvent'. The model should have columns:
   * name, entityType?, entityId?, userId?, meta (Json)?, createdAt.
   */
  eventModel: string;
}

export interface CattoEventsModuleOptions {
  /**
   * Provider token that resolves to the app's Prisma service or client.
   * The service accesses `prisma.client ?? prisma` then the event model.
   */
  prismaToken: any;
  /** Prisma model name for events. Default: 'appEvent'. */
  eventModel?: string;
}
