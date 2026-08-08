// @ccatto/react-pages — toNavTree
//
// Map a `pageTree` (from @ccatto/nest-pages) to @ccatto/ui's `NavTreeItem[]` so it
// feeds `SidebarTreeNavCatto` with no glue. Pure — safe on the server.
import type { NavTreeItem } from '@ccatto/ui';
import type { PageNodeDTO } from './types';

export interface ToNavTreeOptions {
  /** Build a page's href. Default: `${basePath}/${page.path}` when `basePath` set. */
  hrefFor?: (page: PageNodeDTO) => string | undefined;
  /** Route prefix, e.g. "/pickle-talk". Ignored when `hrefFor` is provided. */
  basePath?: string;
  /** Map a page's `icon` string to a React node (icons are strings in the DB). */
  iconFor?: (page: PageNodeDTO) => NavTreeItem['icon'];
}

export function toNavTree(
  pages: PageNodeDTO[],
  options: ToNavTreeOptions = {},
): NavTreeItem[] {
  const { hrefFor, basePath, iconFor } = options;
  const href = (p: PageNodeDTO): string | undefined => {
    if (hrefFor) return hrefFor(p);
    if (basePath != null) return `${basePath.replace(/\/$/, '')}/${p.path}`;
    return undefined;
  };
  const map = (p: PageNodeDTO): NavTreeItem => ({
    key: p.id,
    label: p.title,
    href: href(p),
    icon: iconFor ? iconFor(p) : undefined,
    children: p.children.length ? p.children.map(map) : undefined,
  });
  return pages.map(map);
}
