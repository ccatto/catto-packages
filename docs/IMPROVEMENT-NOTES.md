# Catto Packages — Architecture Notes & Improvement Ideas

> A dogfooding-informed snapshot of how the monorepo works today and open-ended,
> **low-priority** ideas for making it even better. Nothing here is required —
> the packages are functional and in active use across pickle-paddle-reviews,
> catto-software-solutions, and rleaguez. This is a "what could make this nicer"
> menu, not a to-do list. Pick what earns its keep.

## Part 1 — How it works today (observations)

**Two build toolchains, three "use client" strategies.** React/browser packages
build with `tsup`; NestJS/node packages build with `tsc -p tsconfig.build.json`.
The React-Server-Component `"use client"` directive is handled **three different
ways**:
- `@ccatto/ui` — tsup `onSuccess` prepends `"use client"` to **every** output file.
- `@ccatto/react-contact`, `@ccatto/react-analytics` — tsup, **selective**: a
  glob marks only specific entries (or none — react-analytics keeps a server-safe
  barrel and relies on `@next/third-parties`' own boundary).
- `@ccatto/imagekit` — `tsc` + a bespoke `scripts/mark-client.mjs` that marks
  chosen files.

Each of these was reinvented per package. They're all correct, but the variety is
a maintenance and correctness smell — getting the client/server boundary right
took real care in this session (server-safe barrels, two-entry splits).

**Publishing is a bespoke bash loop.** `publish.yml` iterates packages, runs
`npm view <pkg>@<version>`, and publishes when the version isn't live. Versions
are bumped **by hand** in each `package.json`; CHANGELOGs are written **by hand**
(and only 3 of 20 packages have one). This works, but every version bump is a
manual, forgettable step — several were hand-done this session.

**`build:all` is a hand-maintained serial list.** `postinstall` runs it. It
drifted (three packages were missing until just now) because it duplicates
ordering that Turbo already computes from the dependency graph.

**Docs tables drift from reality.** The package tables in `README.md` and
`CLAUDE.md` list versions/counts that go stale (the count was wrong by 5, several
versions were months out of date) because they're updated by hand.

**Consistency is informal.** `repository.url` lacked the `git+` prefix on all 19
packages (npm re-normalized it on every publish); README/CHANGELOG presence and
`files`/`exports`/`sideEffects` shapes vary package to package.

**Testing is uneven.** `@ccatto/ui` is thoroughly tested (1300+ tests, a11y
included); most other packages have light or no tests, and there's no coverage
gate or exports/types validation in CI.

**The dogfooding loop is publish-first.** To try a package change in an app, the
flow is: merge → auto-publish → bump the app's dep → `yarn install`. There's no
pre-publish local-link path, so iterating on a package against a real app is slow.

## Part 2 — Improvement ideas (by impact × effort)

### High value, low effort — the "if we do anything, do these"

1. ✅ **DONE — `publint` + `@arethetypeswrong/cli` in CI.** `yarn check:packages`
   (`scripts/check-packages.mjs`) runs both per-package; wired into `ci.yml` as a
   blocking step. It immediately surfaced (and fixed) the `@ccatto/profanity/nest`
   node10 subpath break. Two systemic findings are documented-ignored with
   follow-ups below (`false-esm` on tsup packages; node10 subpaths on
   bundler-consumed packages).
2. **npm provenance.** Add `--provenance` + `permissions: id-token: write` to
   `publish.yml` for verified supply-chain provenance badges on npm. Near-zero
   effort, real trust signal.
3. **Replace `build:all` with `turbo run build`.** Turbo already topo-orders from
   the dep graph, so `postinstall: turbo run build` eliminates the hand-maintained
   list (and its entire drift class — see the bug fixed this session). Verify
   postinstall timing, then delete the serial string.
4. **A package-consistency check in CI** (`syncpack` or `@manypkg/cli`). Enforce
   `repository`/`license`/`author`/`publishConfig`/`files`/`exports` shape and
   presence of `README.md`/`CHANGELOG.md` across all packages. Would have caught
   the `git+` normalization and the two missing READMEs automatically.

### Medium value, medium effort

5. **Adopt Changesets (`@changesets/cli`).** The standard monorepo answer to the
   manual-bump + manual-changelog + bespoke-publish problem. Contributors add a
   changeset per PR; CI computes versions, writes CHANGELOGs, and publishes. Would
   retire the hand-bumping and the custom publish loop, and give every package a
   real CHANGELOG. Bigger migration, high long-term payoff.
6. **Shared build preset for React packages.** A `tsup.preset.ts` (or a tiny
   internal `@ccatto/tsconfig` / build-config package) with a declarative
   `clientEntries` option, so all React packages handle `"use client"` the *same*
   way instead of the current three variants. Collapses the biggest correctness
   footgun into one reviewed place.
7. **Auto-generate the docs tables.** A script that reads every `package.json` and
   regenerates the package table in `README.md` + `CLAUDE.md` (run in CI or a
   pre-commit hook). Kills the version/count drift permanently.

### Nice-to-have / later

8. **Local dogfooding loop** — a Verdaccio local registry (or `yalc`) so a package
   change can be tried in a real app *before* publishing. Directly speeds the
   extract → test → publish cycle the team lives in.
9. **Coverage + a11y beyond `@ccatto/ui`.** A modest coverage floor in CI, and
   extend the a11y test pattern to the other React components.
10. **`engines` field + Node version consistency** across packages.
11. **Package-level ideas already noted in BACKLOG:** analytics consent-gating,
    `GoogleTagManagerCatto`, Cloudflare Web Analytics variant.

## Part 3 — Suggested sequence (only if/when it's worth it)

`publint`/`attw` + provenance (guardrails) → `turbo run build` + consistency
check (kill drift classes) → Changesets (retire manual publishing) → shared build
preset (kill the `"use client"` footgun) → generated docs tables. Each step is
independently valuable and independently skippable.

---

_Snapshot date: 2026-08-07. Verify specifics against the current `package.json`
files — this doc will itself drift (which is rather the point of idea #7)._
