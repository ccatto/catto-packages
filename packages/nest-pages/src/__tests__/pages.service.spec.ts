import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CattoPagesService } from '../pages.service';
import { CattoPagesConfig } from '../interfaces/config.interfaces';
import { PageStatus } from '../dto/page.dto';
import { defaultSlugify } from '../slugify';

function makeModel() {
  return {
    findMany: jest.fn(async (_args?: any) => [] as any[]),
    findFirst: jest.fn(async (_args?: any) => null as any),
    findUnique: jest.fn(async (_args?: any) => null as any),
    count: jest.fn(async (_args?: any) => 0),
    create: jest.fn(async ({ data }: any) => ({ id: 'new', ...data })),
    update: jest.fn(async ({ where, data }: any) => ({ id: where.id, ...data })),
    delete: jest.fn(async (_args?: any) => ({})),
    deleteMany: jest.fn(async (_args?: any) => ({ count: 0 })),
  };
}

function makeConfig(over: Partial<CattoPagesConfig> = {}): CattoPagesConfig {
  return {
    pageModel: 'page',
    slugify: defaultSlugify,
    deleteWithChildren: 'reject',
    ...over,
  };
}

function makeService(config = makeConfig(), model = makeModel()) {
  const service = new CattoPagesService(config, { page: model } as any);
  return { service, model };
}

describe('defaultSlugify', () => {
  it('lowercases, hyphenates, strips junk', () => {
    expect(defaultSlugify('The Rules of Pickleball!')).toBe(
      'the-rules-of-pickleball',
    );
    expect(defaultSlugify('  Ready   Position  ')).toBe('ready-position');
  });
});

describe('CattoPagesService.tree', () => {
  it('builds a nested tree with computed paths, ordered', async () => {
    const rows = [
      { id: 'a', parentId: null, slug: 'training', order: 1 },
      { id: 'root', parentId: null, slug: 'rules', order: 0 },
      { id: 'b', parentId: 'a', slug: 'shots', order: 0 },
      { id: 'c', parentId: 'b', slug: 'forehand', order: 0 },
    ];
    const { service, model } = makeService();
    model.findMany.mockResolvedValueOnce(rows);
    const tree = await service.tree('pickle_talk');

    expect(tree.map((n) => n.slug)).toEqual(['rules', 'training']); // order asc
    const training = tree[1];
    expect(training.children[0].children[0].path).toBe(
      'training/shots/forehand',
    );
  });

  it('filters drafts for public reads', async () => {
    const { service, model } = makeService();
    await service.tree('ns', { includeDrafts: false });
    expect(model.findMany.mock.calls[0][0].where.status).toBe(
      PageStatus.PUBLISHED,
    );
  });
});

describe('CattoPagesService.byPath', () => {
  it('walks the slug chain segment by segment', async () => {
    const { service, model } = makeService();
    model.findFirst
      .mockResolvedValueOnce({ id: 't', slug: 'training' })
      .mockResolvedValueOnce({ id: 's', slug: 'shots' });
    model.findMany.mockResolvedValueOnce([]);
    const page = await service.byPath('ns', 'training/shots');
    expect(page.id).toBe('s');
    expect(page.path).toBe('training/shots');
    expect(model.findFirst).toHaveBeenCalledTimes(2);
  });

  it('throws NotFound when a segment is missing', async () => {
    const { service, model } = makeService();
    model.findFirst.mockResolvedValueOnce(null);
    await expect(service.byPath('ns', 'nope')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

describe('CattoPagesService.create', () => {
  it('auto-slugifies the title and appends order', async () => {
    const { service, model } = makeService();
    model.findFirst.mockResolvedValueOnce({ order: 4 }); // last sibling
    await service.create({ namespace: 'ns', title: 'Ready Position' });
    const data = model.create.mock.calls[0][0].data;
    expect(data.slug).toBe('ready-position');
    expect(data.order).toBe(5);
    expect(data.status).toBe(PageStatus.DRAFT);
  });

  it('maps a unique-constraint violation to a clear error', async () => {
    const { service, model } = makeService();
    model.create.mockRejectedValueOnce({ code: 'P2002' });
    await expect(
      service.create({ namespace: 'ns', title: 'Rules' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe('CattoPagesService.delete', () => {
  it('rejects deleting a page that has children (default)', async () => {
    const { service, model } = makeService();
    model.findUnique.mockResolvedValueOnce({ id: 'p', namespace: 'ns' });
    model.count.mockResolvedValueOnce(2);
    await expect(service.delete('p')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(model.delete).not.toHaveBeenCalled();
  });

  it('cascades when configured', async () => {
    const { service, model } = makeService(
      makeConfig({ deleteWithChildren: 'cascade' }),
    );
    model.findUnique.mockResolvedValueOnce({ id: 'p', namespace: 'ns' });
    model.count.mockResolvedValueOnce(1);
    model.findMany.mockResolvedValueOnce([{ id: 'child', parentId: 'p' }]);
    const ok = await service.delete('p');
    expect(ok).toBe(true);
    expect(model.deleteMany.mock.calls[0][0].where.id.in).toEqual(
      expect.arrayContaining(['child', 'p']),
    );
  });
});

describe('CattoPagesService.reorder', () => {
  it('writes each id its index as order', async () => {
    const { service, model } = makeService();
    await service.reorder('parent', ['x', 'y', 'z']);
    expect(model.update).toHaveBeenCalledTimes(3);
    expect(model.update.mock.calls[1][0]).toEqual({
      where: { id: 'y' },
      data: { order: 1 },
    });
  });
});
