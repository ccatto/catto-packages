/**
 * @ccatto/nest-pages - CattoPagesModule
 *
 * Admin-authored nested content pages (a page CMS), keyed by a generic
 * namespace/slug/parent so any app can host one or more page trees.
 *
 * ## Usage
 *
 * ```typescript
 * import { CattoPagesModule } from '@ccatto/nest-pages';
 * import { PrismaService } from './prisma/prisma.service';
 *
 * @Module({
 *   imports: [
 *     // CattoAuthModule.forRoot({...}) must also be registered — admin
 *     // mutations reuse its GqlAuthGuard + PlatformAdminGuard.
 *     CattoPagesModule.forRoot({ prismaToken: PrismaService }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * Your Prisma schema needs a page model (default name `page`):
 *
 * ```prisma
 * enum PageStatus { DRAFT PUBLISHED }
 *
 * model Page {
 *   id          String     @id @default(cuid())
 *   namespace   String
 *   slug        String
 *   parentId    String?
 *   title       String
 *   body        String
 *   excerpt     String?
 *   icon        String?
 *   status      PageStatus @default(DRAFT)
 *   order       Int        @default(0)
 *   updatedById String?
 *   createdAt   DateTime   @default(now())
 *   updatedAt   DateTime   @updatedAt
 *   @@unique([namespace, parentId, slug])
 *   @@index([namespace, status])
 *   @@map("page")
 * }
 * ```
 */
import { Module, DynamicModule } from '@nestjs/common';
import { CATTO_PAGES_CONFIG, CATTO_PAGES_PRISMA } from './constants';
import {
  CattoPagesConfig,
  CattoPagesModuleOptions,
} from './interfaces/config.interfaces';
import { CattoPagesService } from './pages.service';
import { PagesResolver } from './pages.resolver';
import { defaultSlugify } from './slugify';

@Module({})
export class CattoPagesModule {
  static forRoot(options: CattoPagesModuleOptions): DynamicModule {
    if (!options.prismaToken) {
      throw new Error(
        '@ccatto/nest-pages: prismaToken is required in CattoPagesModule.forRoot()',
      );
    }

    const config: CattoPagesConfig = {
      pageModel: options.pageModel ?? 'page',
      slugify: options.slugify ?? defaultSlugify,
      deleteWithChildren: options.deleteWithChildren ?? 'reject',
    };

    return {
      module: CattoPagesModule,
      global: true,
      providers: [
        { provide: CATTO_PAGES_CONFIG, useValue: config },
        { provide: CATTO_PAGES_PRISMA, useExisting: options.prismaToken },
        CattoPagesService,
        PagesResolver,
      ],
      exports: [CattoPagesService],
    };
  }
}
