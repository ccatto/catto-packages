// @ccatto/react-pages
//
// Transport-agnostic page-CMS UI, pairing with @ccatto/nest-pages. Render Markdown
// pages, manage the tree with drag-reorder, edit pages, and map the page tree to
// @ccatto/ui's SidebarTreeNavCatto. Inject async data callbacks (wire to Apollo/
// fetch); this package ships no data client and no markdown/sanitizer dependency.

export { PageBodyCatto } from './components/PageBodyCatto';
export type { PageBodyCattoProps } from './components/PageBodyCatto';

export { PageAdminTreeCatto } from './components/PageAdminTreeCatto';
export type { PageAdminTreeCattoProps } from './components/PageAdminTreeCatto';

export { PageEditorCatto } from './components/PageEditorCatto';
export type {
  PageEditorCattoProps,
  PageParentOption,
} from './components/PageEditorCatto';

export { usePageManager } from './hooks/usePageManager';
export type {
  UsePageManagerConfig,
  UsePageManagerReturn,
} from './hooks/usePageManager';

export { toNavTree } from './toNavTree';
export type { ToNavTreeOptions } from './toNavTree';

export { slugify } from './slugify';

export {
  DEFAULT_EDITOR_LABELS,
  DEFAULT_ADMIN_TREE_LABELS,
} from './labels';
export type { PageEditorLabels, PageAdminTreeLabels } from './labels';

export type {
  PageNodeDTO,
  PageStatus,
  CreatePageVars,
  UpdatePageVars,
  RenderMarkdown,
} from './types';
