# Catto Packages — Backlog

Cross-package task backlog for `@ccatto/*`. Each entry is self-contained enough
for a future session (human or Claude) to pick up and execute. Move completed
items to the bottom **Done** section with the shipping version.

---

## Open

### `ProductFilterSidebarCatto` mobile polish (`@ccatto/ui`)

**Status:** open · **Effort:** small · **Type:** bugfix + minor API add
**Consumers to keep working:** pickle-paddle-reviews (`PaddlesClient`, `BallsClient`), rleaguez

Fix two mobile UX issues in `ProductFilterSidebarCatto` (the faceted filter
sidebar). Both must be **backward-compatible**.

**Current API (do not break):**
```ts
interface ProductFilterSidebarCattoProps {
  sections: FilterSection[];
  onChange: (sectionKey: string, value: string) => void;
  searchSlot?: React.ReactNode;
  header?: React.ReactNode;
  onClearAll?: () => void;              // renders a "Clear all" button in the header
  collapsible?: boolean;
  isOpen?: boolean; onOpen?: () => void; onClose?: () => void;  // mobile drawer + hamburger trigger
  mobileTriggerLabel?: string;          // default "Filters"
  LinkComponent?: ...;
  className?: string;
}
```
On mobile the component renders a "Filters" hamburger trigger and a **left
`DrawerCatto`** holding the sections.

**Fix 1 — Mobile drawer too narrow (content clips).** The left fly-out clips:
left edge cut off, and the right-side "Clear all" button partially cut. Widen
the mobile drawer to ~**75–80% of viewport width** (or a sensible `max-w`) and
add **horizontal padding** so nothing touches the edges. Rendered via the
internal `DrawerCatto` — pass a wider width + ensure the inner container has
`px` padding. Verify at 360–430px widths.

**Fix 2 — Let the trigger sit inline with the page heading.** Today the
"Filters" hamburger renders on its own line, wasting vertical space. Consumers
want it **inline with their page `<h1>`, right-justified** (mobile only). Add an
API so the app controls placement:
- Preferred: add **`hideMobileTrigger?: boolean`** (when true, render the drawer
  but NOT the built-in trigger) **and export the open handler** so the app
  renders its own button calling `onOpen`.
- Alternative: a **`renderTrigger?: (open: () => void) => ReactNode`** slot.
- Keep default behavior (built-in trigger) unchanged when neither is set.

**Conventions:** preserve `"use client"` as the FIRST line of compiled output
(tsup `onSuccess` handles this); backward compatible; bump `@ccatto/ui` **minor**;
update README/CHANGELOG; typecheck + build must pass; no new runtime deps.

**Acceptance:**
- 390px viewport: drawer ~75–80% wide, no left/right clipping, "Clear all" fully visible.
- With `hideMobileTrigger` (or `renderTrigger`), the app can render the trigger
  inline with its heading; without it, the built-in trigger renders exactly as before.
- Desktop layout unchanged.

**Consumer follow-up (NOT part of this task — for the app maintainer):** after
publish + `yarn install`, pickle's `PaddlesClient`/`BallsClient` render the
trigger inline, right-justified, next to the "Paddles"/"Balls" `<h1>` (mobile
only), passing `hideMobileTrigger`. Publishing to npm + bumping the consumer dep
is done separately by the maintainer.

---

## Done

<!-- Move finished items here, e.g.:
- ✅ `@ccatto/ui@1.8.0` — server-side list controls (useServerPagingCatto, LoadMoreButtonCatto, SortSelectCatto, PaginationCatto) — PR #24
-->
