/**
 * @ccatto/nest-pages - CattoPagesService
 *
 * Admin-authored content pages keyed by (namespace, parentId, slug). Builds the
 * nested tree, resolves a slug path to a page, and manages CRUD + sibling order.
 * There is NO profanity/moderation here — this is admin content (UGC lives in
 * @ccatto/nest-comments).
 */
import {
  Injectable,
  Inject,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CATTO_PAGES_CONFIG, CATTO_PAGES_PRISMA } from './constants';
import { CattoPagesConfig } from './interfaces/config.interfaces';
import { PageNode, PageStatus } from './dto/page.dto';

export interface CreatePageData {
  namespace: string;
  parentId?: string | null;
  title: string;
  slug?: string;
  body?: string;
  excerpt?: string | null;
  icon?: string | null;
  status?: PageStatus;
  updatedById?: string | null;
}

export interface UpdatePageData {
  title?: string;
  slug?: string;
  body?: string;
  excerpt?: string | null;
  icon?: string | null;
  status?: PageStatus;
  updatedById?: string | null;
}

@Injectable()
export class CattoPagesService {
  private readonly logger = new Logger(CattoPagesService.name);

  constructor(
    @Inject(CATTO_PAGES_CONFIG) private readonly config: CattoPagesConfig,
    @Inject(CATTO_PAGES_PRISMA) private readonly prisma: any,
  ) {}

  private get client(): any {
    return this.prisma?.client ?? this.prisma;
  }

  /** Prisma delegate for the page model. */
  private get model(): any {
    return this.client?.[this.config.pageModel];
  }

  private isP2002(err: unknown): boolean {
    return (
      !!err &&
      typeof err === 'object' &&
      (err as { code?: string }).code === 'P2002'
    );
  }

  // ---- reads ------------------------------------------------------------

  /** Nested tree for a namespace (PUBLISHED only unless `includeDrafts`). */
  async tree(
    namespace: string,
    options: { includeDrafts?: boolean } = {},
  ): Promise<PageNode[]> {
    const where: Record<string, unknown> = { namespace };
    if (!options.includeDrafts) where.status = PageStatus.PUBLISHED;
    const rows: any[] = await this.model.findMany({
      where,
      orderBy: { order: 'asc' },
    });
    return this.buildTree(rows);
  }

  /** Resolve a slug path (e.g. "training/shots/forehand") to a page. */
  async byPath(
    namespace: string,
    path: string,
    options: { includeDrafts?: boolean } = {},
  ): Promise<PageNode> {
    const segments = (path || '')
      .split('/')
      .map((s) => s.trim())
      .filter(Boolean);
    if (segments.length === 0) {
      throw new NotFoundException('Page not found');
    }

    let parentId: string | null = null;
    let current: any = null;
    for (const slug of segments) {
      const where: Record<string, unknown> = { namespace, parentId, slug };
      if (!options.includeDrafts) where.status = PageStatus.PUBLISHED;
      current = await this.model.findFirst({ where });
      if (!current) throw new NotFoundException('Page not found');
      parentId = current.id;
    }

    // Attach ordered children + the resolved path.
    const kids: any[] = await this.model.findMany({
      where: {
        namespace,
        parentId: current.id,
        ...(options.includeDrafts ? {} : { status: PageStatus.PUBLISHED }),
      },
      orderBy: { order: 'asc' },
    });
    return {
      ...current,
      path: segments.join('/'),
      children: kids.map((k) => ({
        ...k,
        path: `${segments.join('/')}/${k.slug}`,
        children: [],
      })),
    };
  }

  private buildTree(rows: any[]): PageNode[] {
    const byParent = new Map<string | null, any[]>();
    for (const r of rows) {
      const key = r.parentId ?? null;
      const arr = byParent.get(key);
      if (arr) arr.push(r);
      else byParent.set(key, [r]);
    }
    const build = (parentId: string | null, parentPath: string): PageNode[] => {
      const kids = (byParent.get(parentId) ?? []).sort(
        (a, b) => a.order - b.order,
      );
      return kids.map((r) => {
        const path = parentPath ? `${parentPath}/${r.slug}` : r.slug;
        return { ...r, path, children: build(r.id, path) };
      });
    };
    return build(null, '');
  }

  // ---- writes -----------------------------------------------------------

  async create(data: CreatePageData): Promise<any> {
    const slug = this.config.slugify(data.slug || data.title);
    if (!slug) throw new BadRequestException('A title or slug is required');

    const last = await this.model.findFirst({
      where: { namespace: data.namespace, parentId: data.parentId ?? null },
      orderBy: { order: 'desc' },
      select: { order: true },
    });
    const order = (last?.order ?? -1) + 1;

    try {
      return await this.model.create({
        data: {
          namespace: data.namespace,
          parentId: data.parentId ?? null,
          title: data.title,
          slug,
          body: data.body ?? '',
          excerpt: data.excerpt ?? null,
          icon: data.icon ?? null,
          status: data.status ?? PageStatus.DRAFT,
          order,
          updatedById: data.updatedById ?? null,
        },
      });
    } catch (err) {
      if (this.isP2002(err)) {
        throw new BadRequestException(
          `A page with slug "${slug}" already exists among its siblings`,
        );
      }
      throw err;
    }
  }

  async update(id: string, data: UpdatePageData): Promise<any> {
    const patch: Record<string, unknown> = {};
    if (data.title !== undefined) patch.title = data.title;
    // Slug only changes when explicitly provided (URLs stay stable on rename).
    if (data.slug !== undefined) patch.slug = this.config.slugify(data.slug);
    if (data.body !== undefined) patch.body = data.body;
    if (data.excerpt !== undefined) patch.excerpt = data.excerpt;
    if (data.icon !== undefined) patch.icon = data.icon;
    if (data.status !== undefined) patch.status = data.status;
    if (data.updatedById !== undefined) patch.updatedById = data.updatedById;

    try {
      return await this.model.update({ where: { id }, data: patch });
    } catch (err) {
      if (this.isP2002(err)) {
        throw new BadRequestException(
          'A page with that slug already exists among its siblings',
        );
      }
      throw new NotFoundException('Page not found');
    }
  }

  async delete(id: string): Promise<boolean> {
    const page = await this.model.findUnique({ where: { id } });
    if (!page) throw new NotFoundException('Page not found');

    const childCount = await this.model.count({ where: { parentId: id } });
    if (childCount > 0) {
      if (this.config.deleteWithChildren === 'reject') {
        throw new BadRequestException(
          `Cannot delete: this page has ${childCount} child page(s). Move or delete them first.`,
        );
      }
      // cascade — collect all descendants (parentId isn't an FK relation).
      const ids = await this.collectDescendantIds(page.namespace, id);
      await this.model.deleteMany({ where: { id: { in: [...ids, id] } } });
      return true;
    }

    await this.model.delete({ where: { id } });
    return true;
  }

  private async collectDescendantIds(
    namespace: string,
    rootId: string,
  ): Promise<string[]> {
    const rows: any[] = await this.model.findMany({
      where: { namespace },
      select: { id: true, parentId: true },
    });
    const byParent = new Map<string, string[]>();
    for (const r of rows) {
      if (!r.parentId) continue;
      const arr = byParent.get(r.parentId);
      if (arr) arr.push(r.id);
      else byParent.set(r.parentId, [r.id]);
    }
    const out: string[] = [];
    const walk = (pid: string) => {
      for (const cid of byParent.get(pid) ?? []) {
        out.push(cid);
        walk(cid);
      }
    };
    walk(rootId);
    return out;
  }

  /** Persist a new sibling order (index in `orderedIds` becomes `order`). */
  async reorder(
    parentId: string | null,
    orderedIds: string[],
  ): Promise<boolean> {
    await Promise.all(
      orderedIds.map((id, index) =>
        this.model.update({ where: { id }, data: { order: index } }),
      ),
    );
    return true;
  }

  /** Re-parent a page; it lands at the end of the new sibling group. */
  async move(id: string, newParentId: string | null): Promise<any> {
    const page = await this.model.findUnique({ where: { id } });
    if (!page) throw new NotFoundException('Page not found');

    const last = await this.model.findFirst({
      where: { namespace: page.namespace, parentId: newParentId ?? null },
      orderBy: { order: 'desc' },
      select: { order: true },
    });
    const order = (last?.order ?? -1) + 1;

    try {
      return await this.model.update({
        where: { id },
        data: { parentId: newParentId ?? null, order },
      });
    } catch (err) {
      if (this.isP2002(err)) {
        throw new BadRequestException(
          'A page with that slug already exists in the destination',
        );
      }
      throw err;
    }
  }
}
