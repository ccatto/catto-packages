/**
 * @ccatto/nest-pages - configuration interfaces
 */

/** What to do when deleting a page that still has children. */
export type DeleteWithChildren = 'reject' | 'cascade';

/** Resolved config injected as CATTO_PAGES_CONFIG (defaults applied). */
export interface CattoPagesConfig {
  /** Prisma model (delegate) name that stores pages. Default: 'page'. */
  pageModel: string;
  /** Turns a title into a URL slug. Default: package `defaultSlugify`. */
  slugify: (input: string) => string;
  /** Deleting a page with children: 'reject' (default) or 'cascade'. */
  deleteWithChildren: DeleteWithChildren;
}

/** Options accepted by CattoPagesModule.forRoot(). */
export interface CattoPagesModuleOptions {
  /**
   * Provider token that resolves to the app's Prisma service or client.
   * The service accesses `prisma.client ?? prisma` then the page model.
   */
  prismaToken: any;
  /** Prisma model name for pages. Default: 'page'. */
  pageModel?: string;
  /** Override the slugify function. Default: package `defaultSlugify`. */
  slugify?: (input: string) => string;
  /** Delete-with-children behavior. Default: 'reject'. */
  deleteWithChildren?: DeleteWithChildren;
}
