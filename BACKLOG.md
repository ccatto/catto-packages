# Catto Packages — Backlog

Cross-package task backlog for `@ccatto/*`. Each entry is self-contained enough
for a future session (human or Claude) to pick up and execute. Move completed
items to the bottom **Done** section with the shipping version.

---

## Open

_No open package work right now._

### Consumer follow-ups (pickle-paddle-reviews — separate repo, maintainer)

These live in the app, not this repo. Do them there after `yarn install`:

- Bump `@ccatto/ui` → `^1.9.0` and `@ccatto/react-contact` → `^1.1.0`.
- Swap the hand-rolled `ContactForm.tsx` for `<ContactFormCatto>` + a route
  handler using `sendContactMessage()` (or keep the GraphQL backend and pass
  `onSubmit`); add the Telnyx/captcha `.env` vars.
- Render the filter trigger inline with the `Paddles`/`Balls` `<h1>` (mobile
  only) using `hideMobileTrigger`.
- (From the earlier paging work) wire `useServerPagingCatto` +
  `LoadMoreButtonCatto` into `PaddlesClient` to replace the hand-rolled
  limit/load-more/sort.

---

## Done

- ✅ `@ccatto/ui@1.9.0` — `ProductFilterSidebarCatto` mobile polish: widened/padded
  mobile drawer (no clipping) + `hideMobileTrigger` prop for inline trigger
  placement — PR #26
- ✅ `@ccatto/react-contact@1.1.0` — plug-n-play contact form: `ContactFormCatto`
  component + framework-agnostic `sendContactMessage()` Telnyx SMS notifier
  (`/server` subpath) — PR #25
- ✅ `@ccatto/ui@1.8.0` — server-side list controls (`useServerPagingCatto`,
  `LoadMoreButtonCatto`, `SortSelectCatto`, `PaginationCatto`) — PR #24
