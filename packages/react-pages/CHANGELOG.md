# Changelog

All notable changes to `@ccatto/react-pages` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-08-08

### Added

- Initial release. Transport-agnostic page-CMS UI, pairing with
  `@ccatto/nest-pages`.
- **`<PageBodyCatto>`** — renders a page's Markdown via an injected
  `renderMarkdown` (app owns sanitization); escaped plain-text fallback when
  omitted (never raw HTML).
- **`usePageManager`** + **`<PageAdminTreeCatto>`** — admin tree with drag-reorder
  (via `@ccatto/ui`'s `useDragDropList`), add-child / edit / delete; optimistic
  reorder + auto-refresh on structural changes.
- **`<PageEditorCatto>`** — create/edit form with auto-slug (editable), parent
  selector, Markdown body + live preview, Draft/Published toggle.
- **`toNavTree(pageTree, opts)`** — maps a page tree to `@ccatto/ui`'s
  `NavTreeItem[]` for `SidebarTreeNavCatto`.
- **`slugify`** util; overridable i18n via `labels`.
