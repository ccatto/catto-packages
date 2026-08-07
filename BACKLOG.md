# Catto Packages — Backlog

Cross-package task backlog for `@ccatto/*`. Each entry is self-contained enough
for a future session (human or Claude) to pick up and execute. Move completed
items to the bottom **Done** section with the shipping version.

---

## Open

_No open package work right now._

**Confirmed benign (no action):** the `yarn build` warning `Module level
directives cause errors when bundled, "use client" in "dist/index.*" was ignored`
comes from `@ccatto/ui` bundling its own components — each component source has a
top-of-file `"use client"` that rollup strips when concatenating modules, and the
tsup `onSuccess` step re-adds a single authoritative top-level directive (verified
`head -1 dist/index.js` == `"use client"`). Cosmetic; silencing it would mean a
risky refactor of every component for no runtime benefit.

### Consumer follow-ups (separate repos, maintainer)

These live in the apps, not this repo. Do them there after `yarn install`.

**pickle-paddle-reviews**
- Bump `@ccatto/ui` → `^1.9.0` and `@ccatto/react-contact` → `^1.1.0`.
- Swap the hand-rolled `ContactForm.tsx` for `<ContactFormCatto>` + a route
  handler using `sendContactMessage()` (or keep the GraphQL backend and pass
  `onSubmit`); add the Telnyx/captcha `.env` vars.
- Render the filter trigger inline with the `Paddles`/`Balls` `<h1>` (mobile
  only) using `hideMobileTrigger`.
- (From the earlier paging work) wire `useServerPagingCatto` +
  `LoadMoreButtonCatto` into `PaddlesClient` to replace the hand-rolled
  limit/load-more/sort.
- **Add GA4** via `@ccatto/react-analytics@^1.1.0` + `@next/third-parties@16`:
  render `<GoogleAnalyticsCatto/>` + `<AnalyticsPlatformCatto/>` (from
  `@ccatto/react-analytics/platform`) in `app/[locale]/layout.tsx`; set
  `NEXT_PUBLIC_GA_MEASUREMENT_ID` (pickle's own GA4 Web-stream id) in env +
  Dockerfile ARG; register `app_platform` as a User-scoped custom dimension in
  the GA admin. One property/one Web stream covers web + the Capacitor WebView —
  no native app streams. (Detailed hand-off prompt already provided in chat.)

**catto-software-solutions**
- Replace the direct `GoogleAnalytics` import + `{gaMeasurementId ? … : null}`
  block in `apps/frontend/app/[locale]/layout.tsx` with `<GoogleAnalyticsCatto/>`
  (+ optionally `<AnalyticsPlatformCatto/>` if it ships a Capacitor build); keep
  the existing `NEXT_PUBLIC_GA_MEASUREMENT_ID` env + Dockerfile ARG.

**rleaguez**
- Swap any bespoke GA snippet for `@ccatto/react-analytics` using its existing
  GA4 property id.

### Package ideas (optional, later)
- `@ccatto/react-analytics`: optional consent gating (`enabled` prop /
  cookie-consent hook) for GDPR regions; a `GoogleTagManagerCatto` sibling; a
  cookieless Cloudflare Web Analytics variant. (Nice-to-haves from the GA
  handoff doc — not needed for v1.)

---

## Done

- ✅ `@ccatto/react-analytics@1.1.0` — Capacitor platform support: `app_platform`
  dimension via `<AnalyticsPlatformCatto/>` (`/platform` subpath) +
  `getCapacitorPlatform`/`setUserProperties`/`useAnalyticsPlatform` — PR #30
- ✅ `@ccatto/react-analytics@1.0.0` — new package: drop-in GA4 for Next.js App
  Router (`<GoogleAnalyticsCatto/>` + `trackEvent`) — PR #29
- ✅ docs — refresh `CLAUDE.md` to 19→20 packages + current versions; fix the
  "only package above 1.0.0" gotcha — PRs #28, #29, #30
- ✅ `@ccatto/imagekit@1.1.1` + `@ccatto/nest-events@1.0.1` — add package READMEs
  (were publishing with a blank npm page); patch bump to republish with docs
- ✅ CI — bump `actions/checkout` + `actions/setup-node` `@v4` → `@v5` (clears the
  Node 20 deprecation warning) in `ci.yml` + `publish.yml`
- ✅ `@ccatto/ui@1.9.0` — `ProductFilterSidebarCatto` mobile polish: widened/padded
  mobile drawer (no clipping) + `hideMobileTrigger` prop for inline trigger
  placement — PR #26
- ✅ `@ccatto/react-contact@1.1.0` — plug-n-play contact form: `ContactFormCatto`
  component + framework-agnostic `sendContactMessage()` Telnyx SMS notifier
  (`/server` subpath) — PR #25
- ✅ `@ccatto/ui@1.8.0` — server-side list controls (`useServerPagingCatto`,
  `LoadMoreButtonCatto`, `SortSelectCatto`, `PaginationCatto`) — PR #24
