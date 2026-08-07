# Catto Packages — Backlog

Cross-package task backlog for `@ccatto/*`. Each entry is self-contained enough
for a future session (human or Claude) to pick up and execute. Move completed
items to the bottom **Done** section with the shipping version.

---

## Open

### Docs / hygiene (low priority)

- **Missing package READMEs.** `@ccatto/imagekit` (1.1.0) and `@ccatto/nest-events`
  (1.0.0) are published with no `README.md` — npm shows a blank page. Add a
  README to each (usage + install + peer deps) and add it to their `files`
  array. Every other package has one.
- **CI Node 20 deprecation.** `.github/workflows/*` use `actions/checkout@v4` and
  `actions/setup-node@v4`, which GitHub now force-runs on Node 24 with a
  deprecation warning. Bump both to `@v5` in `ci.yml` and `publish.yml`.
- **`"use client"` bundling warning.** `yarn build` logs `Module level directives
  cause errors when bundled, "use client" in "dist/index.*" was ignored` for
  packages that bundle a `"use client"` dep. Confirm it's benign (it appears to
  be) or mark the dep external so the directive is preserved.

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
