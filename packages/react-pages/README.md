# @ccatto/react-pages

React UI for a **page CMS** — render Markdown pages, manage a nested page tree
with **drag-reorder**, edit pages, and map the page tree straight into
`@ccatto/ui`'s `SidebarTreeNavCatto`. Pairs with the backend `@ccatto/nest-pages`.

**Transport-agnostic** (inject async callbacks; no data client) and **ships no
markdown/sanitizer dependency** — you pass a `renderMarkdown` and own
sanitization. Mirrors `@ccatto/react-comments`.

- **`<PageBodyCatto markdown renderMarkdown? />`** — renders a page body.
- **`usePageManager` / `<PageAdminTreeCatto>`** — admin tree with drag-reorder
  (via `@ccatto/ui`'s `useDragDropList` — desktop, touch, keyboard) + add/edit/delete.
- **`<PageEditorCatto>`** — create/edit form with auto-slug + live Markdown preview.
- **`toNavTree(pageTree)`** — `PageNode[]` → `NavTreeItem[]` for the sidebar nav.

## Install

```bash
yarn add @ccatto/react-pages
```

Peers: `react` (>=18) and **`@ccatto/ui`** (>=1.10.0). No markdown dep.

## Rendering a page (safe Markdown)

The app owns sanitization — install a renderer and pass it in. Recommended:
`react-markdown` + `rehype-sanitize` (or `marked` + `DOMPurify`).

```tsx
import Markdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { PageBodyCatto } from '@ccatto/react-pages';

const renderMarkdown = (md: string) => (
  <Markdown rehypePlugins={[rehypeSanitize]}>{md}</Markdown>
);

// in your [...slug] route, after fetching pageByPath:
<PageBodyCatto markdown={page.body} renderMarkdown={renderMarkdown} className="prose dark:prose-invert" />;
```

> Without `renderMarkdown`, `<PageBodyCatto>` renders the body as **escaped plain
> text** (never raw HTML) so it can't inject — but you'll want real formatting.

## Nav from the page tree

```tsx
import { toNavTree } from '@ccatto/react-pages';
import { SidebarTreeNavCatto } from '@ccatto/ui';

const items = toNavTree(pageTree, { basePath: '/pickle-talk' });
<SidebarTreeNavCatto items={items} currentPath={pathname} LinkComponent={Link} />;
```

`toNavTree(tree, { basePath | hrefFor, iconFor })` maps each page to a
`NavTreeItem` (`key: page.id`, `label: page.title`, `href`, nested `children`).

## Admin management surface

```tsx
'use client';
import { usePageManager, PageAdminTreeCatto, PageEditorCatto } from '@ccatto/react-pages';

const mgr = usePageManager({
  namespace: 'pickle_talk',
  fetchTree: (ns) => runQuery(PAGES_FOR_ADMIN, { namespace: ns }),   // admin query
  createPage: (vars) => runMutation(CREATE_PAGE, { input: vars }),
  updatePage: (id, vars) => runMutation(UPDATE_PAGE, { id, input: vars }),
  deletePage: (id) => runMutation(DELETE_PAGE, { id }),
  reorderPages: (parentId, orderedIds) => runMutation(REORDER_PAGES, { parentId, orderedIds }),
});

const [editing, setEditing] = useState<PageNodeDTO | { parentId: string | null } | null>(null);

<PageAdminTreeCatto
  manager={mgr}
  onEditPage={(page) => setEditing(page)}
  onAddPage={(parentId) => setEditing({ parentId })}
/>;

{editing && (
  <PageEditorCatto
    namespace="pickle_talk"
    page={'id' in editing ? editing : null}
    parentId={'parentId' in editing ? editing.parentId : null}
    renderMarkdown={renderMarkdown}
    onSave={async (vars, id) => {
      id ? await mgr.updatePage(id, vars) : await mgr.createPage(vars);
      setEditing(null); // mgr auto-refreshes the tree
    }}
    onDelete={async (id) => { await mgr.deletePage(id); setEditing(null); }}
    onCancel={() => setEditing(null)}
  />
)}
```

Drag a row to reorder its siblings (works on desktop, touch, and keyboard — Space
to grab, arrows to move); `usePageManager` optimistically updates and persists via
`reorderPages`. Build the callbacks against `@ccatto/nest-pages`' GraphQL API.

## i18n

Every string is overridable via the `labels` prop
(`Partial<PageEditorLabels>` / `Partial<PageAdminTreeLabels>`; defaults exported as
`DEFAULT_EDITOR_LABELS` / `DEFAULT_ADMIN_TREE_LABELS`).

## License

MIT
