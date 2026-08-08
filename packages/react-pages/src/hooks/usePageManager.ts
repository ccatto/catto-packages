// @ccatto/react-pages — usePageManager
//
// Headless admin state for the page CMS: loads the tree (drafts included, via
// your admin query), and wraps create/update/delete/reorder/move. Structural
// changes refresh; reorder is optimistic. Wire the callbacks to your GraphQL
// (e.g. @ccatto/nest-pages' pagesForAdmin + the admin mutations).
import { useCallback, useEffect, useState } from 'react';
import type {
  CreatePageVars,
  PageNodeDTO,
  UpdatePageVars,
} from '../types';

export interface UsePageManagerConfig {
  namespace: string;
  fetchTree: (namespace: string) => Promise<PageNodeDTO[]>;
  createPage: (vars: CreatePageVars) => Promise<PageNodeDTO>;
  updatePage: (id: string, vars: UpdatePageVars) => Promise<PageNodeDTO>;
  deletePage: (id: string) => Promise<unknown>;
  reorderPages: (
    parentId: string | null,
    orderedIds: string[],
  ) => Promise<unknown>;
  movePage?: (id: string, newParentId: string | null) => Promise<unknown>;
}

export interface UsePageManagerReturn {
  tree: PageNodeDTO[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  createPage: (vars: CreatePageVars) => Promise<PageNodeDTO | null>;
  updatePage: (id: string, vars: UpdatePageVars) => Promise<PageNodeDTO | null>;
  deletePage: (id: string) => Promise<boolean>;
  reorderSiblings: (
    parentId: string | null,
    orderedIds: string[],
  ) => Promise<void>;
  movePage: (id: string, newParentId: string | null) => Promise<void>;
}

/** Reorder one sibling group (by parentId) within a nested tree. */
function reorderGroup(
  tree: PageNodeDTO[],
  parentId: string | null,
  orderedIds: string[],
): PageNodeDTO[] {
  const rank = new Map(orderedIds.map((id, i) => [id, i]));
  const rec = (nodes: PageNodeDTO[], pid: string | null): PageNodeDTO[] => {
    const mapped = nodes.map((n) => ({ ...n, children: rec(n.children, n.id) }));
    if (pid === parentId) {
      return [...mapped].sort(
        (a, b) => (rank.get(a.id) ?? a.order) - (rank.get(b.id) ?? b.order),
      );
    }
    return mapped;
  };
  return rec(tree, null);
}

export function usePageManager(
  config: UsePageManagerConfig,
): UsePageManagerReturn {
  const {
    namespace,
    fetchTree,
    createPage,
    updatePage,
    deletePage,
    reorderPages,
    movePage,
  } = config;

  const [tree, setTree] = useState<PageNodeDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTree(await fetchTree(namespace));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [fetchTree, namespace]);

  useEffect(() => {
    void load();
  }, [load]);

  const wrap = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | null> => {
      setError(null);
      try {
        const result = await fn();
        await load();
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        return null;
      }
    },
    [load],
  );

  const doCreate = useCallback(
    (vars: CreatePageVars) => wrap(() => createPage(vars)),
    [wrap, createPage],
  );
  const doUpdate = useCallback(
    (id: string, vars: UpdatePageVars) => wrap(() => updatePage(id, vars)),
    [wrap, updatePage],
  );
  const doDelete = useCallback(
    async (id: string) => (await wrap(() => deletePage(id))) !== null,
    [wrap, deletePage],
  );

  const reorderSiblings = useCallback(
    async (parentId: string | null, orderedIds: string[]) => {
      setTree((prev) => reorderGroup(prev, parentId, orderedIds)); // optimistic
      try {
        await reorderPages(parentId, orderedIds);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        void load(); // roll back to server truth
      }
    },
    [reorderPages, load],
  );

  const doMove = useCallback(
    async (id: string, newParentId: string | null) => {
      if (!movePage) return;
      await wrap(() => movePage(id, newParentId));
    },
    [wrap, movePage],
  );

  return {
    tree,
    loading,
    error,
    refresh: load,
    createPage: doCreate,
    updatePage: doUpdate,
    deletePage: doDelete,
    reorderSiblings,
    movePage: doMove,
  };
}

export default usePageManager;
