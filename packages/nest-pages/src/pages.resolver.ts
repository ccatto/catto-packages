/**
 * @ccatto/nest-pages - PagesResolver
 *
 * Public reads return PUBLISHED pages only; drafts + management go through the
 * admin-guarded queries/mutations (reusing @ccatto/nest-auth's GqlAuthGuard +
 * PlatformAdminGuard — no reinvented auth). Admins preview/edit drafts via
 * `pagesForAdmin` (which returns bodies), so there's no need for optional auth on
 * the public fields.
 */
import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  GqlAuthGuard,
  PlatformAdminGuard,
  CurrentUser,
  TokenUser,
} from '@ccatto/nest-auth';
import { CattoPagesService } from './pages.service';
import {
  CreatePageInput,
  PageNode,
  UpdatePageInput,
} from './dto/page.dto';

@Resolver(() => PageNode)
export class PagesResolver {
  constructor(private readonly pages: CattoPagesService) {}

  // ---- public reads (PUBLISHED only) ----

  @Query(() => [PageNode])
  async pageTree(
    @Args('namespace') namespace: string,
  ): Promise<PageNode[]> {
    return this.pages.tree(namespace, { includeDrafts: false });
  }

  @Query(() => PageNode)
  async pageByPath(
    @Args('namespace') namespace: string,
    @Args('path') path: string,
  ): Promise<PageNode> {
    return this.pages.byPath(namespace, path, { includeDrafts: false });
  }

  // ---- admin ----

  @Query(() => [PageNode])
  @UseGuards(GqlAuthGuard, PlatformAdminGuard)
  async pagesForAdmin(
    @Args('namespace') namespace: string,
  ): Promise<PageNode[]> {
    return this.pages.tree(namespace, { includeDrafts: true });
  }

  @Mutation(() => PageNode)
  @UseGuards(GqlAuthGuard, PlatformAdminGuard)
  async createPage(
    @Args('input') input: CreatePageInput,
    @CurrentUser() user: TokenUser,
  ): Promise<PageNode> {
    return this.pages.create({ ...input, updatedById: user?.userId ?? null });
  }

  @Mutation(() => PageNode)
  @UseGuards(GqlAuthGuard, PlatformAdminGuard)
  async updatePage(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdatePageInput,
    @CurrentUser() user: TokenUser,
  ): Promise<PageNode> {
    return this.pages.update(id, { ...input, updatedById: user?.userId ?? null });
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard, PlatformAdminGuard)
  async deletePage(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.pages.delete(id);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard, PlatformAdminGuard)
  async reorderPages(
    @Args('parentId', { type: () => ID, nullable: true })
    parentId: string | null,
    @Args('orderedIds', { type: () => [ID] }) orderedIds: string[],
  ): Promise<boolean> {
    return this.pages.reorder(parentId ?? null, orderedIds);
  }

  @Mutation(() => PageNode)
  @UseGuards(GqlAuthGuard, PlatformAdminGuard)
  async movePage(
    @Args('id', { type: () => ID }) id: string,
    @Args('newParentId', { type: () => ID, nullable: true })
    newParentId: string | null,
  ): Promise<PageNode> {
    return this.pages.move(id, newParentId ?? null);
  }
}
