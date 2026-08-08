/**
 * @ccatto/nest-pages
 *
 * NestJS module for admin-authored nested content pages (a page CMS). Keyed by a
 * generic namespace/slug/parent; documents a `Page` model the app adds to its own
 * schema.prisma. Public reads return PUBLISHED pages; management reuses
 * @ccatto/nest-auth guards. Pairs with @ccatto/react-pages + @ccatto/nest-comments.
 */
export * from './constants';
export * from './interfaces/config.interfaces';
export * from './catto-pages.module';
export { CattoPagesService } from './pages.service';
export type { CreatePageData, UpdatePageData } from './pages.service';
export { PagesResolver } from './pages.resolver';
export {
  PageStatus,
  PageNode,
  CreatePageInput,
  UpdatePageInput,
} from './dto/page.dto';
export { defaultSlugify } from './slugify';
