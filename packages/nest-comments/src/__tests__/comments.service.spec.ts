import { BadRequestException } from '@nestjs/common';
import { CattoCommentsService } from '../comments.service';
import { CattoCommentsConfig } from '../interfaces/config.interfaces';
import { CommentStatus } from '../dto/comment.dto';

// A minimal in-memory-ish Prisma delegate mock.
function makePrisma() {
  return {
    comment: {
      create: jest.fn(async ({ data }: any) => ({ id: 'c1', ...data })),
      update: jest.fn(async (_args?: any) => ({})),
      findMany: jest.fn(async (_args?: any) => [] as any[]),
      count: jest.fn(async (_args?: any) => 0),
    },
  };
}

function makeConfig(
  overrides: Partial<CattoCommentsConfig> = {},
): CattoCommentsConfig {
  return {
    commentModel: 'comment',
    moderationMode: 'pre',
    maxLength: 4000,
    allowReplies: true,
    autoHideFlagThreshold: 3,
    allowAnonymous: false,
    profanityCheck: (t: string) => /badword/i.test(t),
    ...overrides,
  };
}

function makeService(
  config: CattoCommentsConfig,
  prisma = makePrisma(),
): { service: CattoCommentsService; prisma: ReturnType<typeof makePrisma> } {
  const service = new CattoCommentsService(config, prisma as any);
  return { service, prisma };
}

const baseCreate = {
  entityType: 'pickle_talk_page',
  entityKey: 'rules',
  authorId: 'u1',
  body: 'Great article, thanks!',
};

describe('CattoCommentsService.create', () => {
  it("sets status PENDING in 'pre' mode", async () => {
    const { service, prisma } = makeService(makeConfig({ moderationMode: 'pre' }));
    await service.create(baseCreate);
    expect(prisma.comment.create).toHaveBeenCalledTimes(1);
    expect(prisma.comment.create.mock.calls[0][0].data.status).toBe(
      CommentStatus.PENDING,
    );
  });

  it("sets status APPROVED in 'post' mode", async () => {
    const { service, prisma } = makeService(
      makeConfig({ moderationMode: 'post' }),
    );
    await service.create(baseCreate);
    expect(prisma.comment.create.mock.calls[0][0].data.status).toBe(
      CommentStatus.APPROVED,
    );
  });

  it('rejects profane bodies (server-authoritative)', async () => {
    const { service, prisma } = makeService(makeConfig());
    await expect(
      service.create({ ...baseCreate, body: 'you badword' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.comment.create).not.toHaveBeenCalled();
  });

  it('rejects empty and oversized bodies', async () => {
    const { service } = makeService(makeConfig({ maxLength: 10 }));
    await expect(
      service.create({ ...baseCreate, body: '   ' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.create({ ...baseCreate, body: 'x'.repeat(11) }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects replies when allowReplies is false', async () => {
    const { service } = makeService(makeConfig({ allowReplies: false }));
    await expect(
      service.create({ ...baseCreate, parentId: 'p1' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe('CattoCommentsService.report', () => {
  it('increments flaggedCount and auto-hides at the threshold', async () => {
    const prisma = makePrisma();
    // 1st update = increment -> reaches threshold 3 while APPROVED
    prisma.comment.update
      .mockResolvedValueOnce({
        id: 'c1',
        flaggedCount: 3,
        status: CommentStatus.APPROVED,
      })
      .mockResolvedValueOnce({
        id: 'c1',
        flaggedCount: 3,
        status: CommentStatus.HIDDEN,
      });
    const { service } = makeService(
      makeConfig({ autoHideFlagThreshold: 3 }),
      prisma,
    );

    const result = await service.report('c1');
    expect(prisma.comment.update).toHaveBeenCalledTimes(2);
    expect(result.status).toBe(CommentStatus.HIDDEN);
  });

  it('does not hide below the threshold', async () => {
    const prisma = makePrisma();
    prisma.comment.update.mockResolvedValueOnce({
      id: 'c1',
      flaggedCount: 1,
      status: CommentStatus.APPROVED,
    });
    const { service } = makeService(
      makeConfig({ autoHideFlagThreshold: 3 }),
      prisma,
    );

    const result = await service.report('c1');
    expect(prisma.comment.update).toHaveBeenCalledTimes(1);
    expect(result.status).toBe(CommentStatus.APPROVED);
  });
});

describe('CattoCommentsService.listByEntity', () => {
  it('forces APPROVED for non-admin viewers', async () => {
    const { service, prisma } = makeService(makeConfig());
    await service.listByEntity('pickle_talk_page', 'rules', {
      viewerIsAdmin: false,
      status: CommentStatus.PENDING, // should be ignored
    });
    const where = prisma.comment.findMany.mock.calls[0][0].where;
    expect(where.status).toBe(CommentStatus.APPROVED);
  });

  it('honors an explicit status for admin viewers', async () => {
    const { service, prisma } = makeService(makeConfig());
    await service.listByEntity('pickle_talk_page', 'rules', {
      viewerIsAdmin: true,
      status: CommentStatus.PENDING,
    });
    const where = prisma.comment.findMany.mock.calls[0][0].where;
    expect(where.status).toBe(CommentStatus.PENDING);
  });
});
