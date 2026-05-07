# Catto Packages - Claude Context File

> Shared TypeScript packages published to npm under the `@ccatto` scope, consumed by `catto-app-template` and other Catto apps.

## Project Overview

Monorepo of 14 reusable packages (UI components, logging, auth, NestJS modules, React hooks, Capacitor mobile helpers) managed with Yarn Workspaces and TurboRepo. All packages publish to the public npm registry under `@ccatto/*`.

**Tech Stack**: Yarn Workspaces + TurboRepo + TypeScript 5.7+. React/browser packages build with **tsup** and test with **vitest**; NestJS packages build with **tsc** (`tsconfig.build.json`) and test with **jest**.

## Repository Structure

```
catto-packages/
├── packages/
│   ├── ui/                # @ccatto/ui (the only minor-bumped package: 1.1.0)
│   ├── logger/
│   ├── catto-shared/      # publishes as @ccatto/shared (legacy dir name)
│   ├── profanity/
│   ├── react-auth/
│   ├── react-contact/
│   ├── react-mobile/
│   ├── react-push/
│   ├── nest-auth/
│   ├── nest-email/
│   ├── nest-sms/
│   ├── nest-payments/
│   ├── nest-push/
│   └── nest-recaptcha/
├── docs/
│   └── npm-publishing.md  # NPM_TOKEN rotation, publish workflow
├── .github/workflows/
│   ├── ci.yml             # PR -> build + test
│   └── publish.yml        # main -> auto-publish bumped versions
├── turbo.json
└── CLAUDE.md              # this file
```

## Packages

| Package | Version | Description |
|---------|---------|-------------|
| `@ccatto/ui` | 1.1.0 | React component library (ButtonCatto, CardCatto, TableCatto, etc.) — Tailwind, atomic design, themes |
| `@ccatto/logger` | 1.0.0 | Pino factories for browser and Node.js |
| `@ccatto/shared` | 1.0.0 | Shared utilities (geo, color, profanity re-exports) — source dir is `packages/catto-shared/` |
| `@ccatto/profanity` | 1.0.0 | Content moderation / profanity filtering |
| `@ccatto/react-auth` | 1.0.0 | Better Auth + JWT + mobile auth hooks |
| `@ccatto/react-contact` | 1.0.0 | Contact form hooks with validation and reCAPTCHA |
| `@ccatto/react-mobile` | 1.0.0 | Capacitor hooks (haptics, deep links, network, etc.) |
| `@ccatto/react-push` | 1.0.0 | Push notification hooks for web and mobile |
| `@ccatto/nest-auth` | 1.0.0 | NestJS JWT, WebAuthn, guards, decorators |
| `@ccatto/nest-email` | 1.0.0 | NestJS email module (SendGrid) |
| `@ccatto/nest-sms` | 1.0.0 | NestJS SMS module (Telnyx) |
| `@ccatto/nest-payments` | 1.0.0 | NestJS payments module (Stripe) |
| `@ccatto/nest-push` | 1.0.0 | NestJS push notifications module (Firebase FCM) |
| `@ccatto/nest-recaptcha` | 1.0.0 | NestJS Google reCAPTCHA v3 verification |

## Dependency Graph

```
@ccatto/profanity          (leaf)
@ccatto/logger             (leaf)
@ccatto/shared             -> @ccatto/profanity
@ccatto/react-contact      -> @ccatto/logger
@ccatto/react-mobile       -> @ccatto/logger
@ccatto/react-push         -> @ccatto/logger
(all others are leaves)
```

Turbo's `^build` ensures topological build order automatically.

## Key Commands

```bash
# Root (Turbo orchestrates all packages)
yarn install          # installs deps; postinstall runs build:all
yarn build            # turbo run build (topologically ordered)
yarn test             # turbo run test (depends on build)
yarn lint             # turbo run lint
yarn clean            # turbo run clean
yarn prettier         # format everything

# Per-package (run from package dir, or via workspace flag)
yarn workspace @ccatto/ui build
yarn workspace @ccatto/ui test
yarn workspace @ccatto/ui dev      # tsup --watch (or tsc --watch for nest-*)
yarn workspace @ccatto/ui storybook
```

> **IMPORTANT: Always use Yarn, never npm!** (`packageManager: yarn@1.22.22`)

## Build & Test Conventions

Two patterns coexist depending on package target:

| Pattern | Used by | Build | Test |
|---------|---------|-------|------|
| **Browser/React** | `ui`, `logger`, `react-*` | `tsup` (ESM + CJS + d.ts) | `vitest` |
| **NestJS** | `nest-*`, `shared`, `profanity` | `tsc -p tsconfig.build.json` | `jest` |

- All packages export ESM-first; `ui` and `logger` ship dual ESM/CJS via tsup `exports` map.
- `prepublishOnly` in `ui` runs `test:run && typecheck && build` as a publish gate.
- `publishConfig: { "access": "public" }` is required on every public package.

## Publishing Workflow

Publishing is **fully automated** on merge to `main`:

1. Bump the version in the package's `package.json` on a feature branch.
2. Open a PR — `ci.yml` runs `yarn build` and `yarn test`.
3. Merge to `main` — `publish.yml` triggers (paths-filtered to `packages/**`).
4. The workflow loops every package, runs `npm view <pkg>@<version>`; if that exact version is **not** already published, it runs `npm publish`. Otherwise it skips.
5. Private packages (none currently) are skipped.

Auth uses `NPM_TOKEN` (granular access token, 90-day max lifetime) stored as a GitHub Actions secret. Rotation procedure is in `docs/npm-publishing.md`.

To publish manually: `cd packages/<name> && npm publish` (after `yarn build`).

## Adding a New Package

1. `mkdir packages/<name>` and add `package.json` with `"name": "@ccatto/<name>"`, `"version": "1.0.0"`, `"publishConfig": { "access": "public" }`.
2. Choose tooling: tsup+vitest for browser/React, tsc+jest for NestJS.
3. Add `src/index.ts`, `tsconfig.json` (extend root), and either `tsup.config.ts`/`vitest.config.ts` or `tsconfig.build.json`/`jest.config.js`.
4. Add the workspace build to `build:all` in the root `package.json` in topological order (deps before dependents).
5. Update the package table and dependency graph in `README.md` (and this file).
6. Open a PR — CI verifies; merge auto-publishes the first version.

## Conventions & Gotchas

- **Yarn-only**: never run `npm install` at the root; the lockfile is `yarn.lock` and the toolchain assumes Yarn 1.
- **Directory vs package name mismatch**: `@ccatto/shared` lives in `packages/catto-shared/` (legacy directory name retained to avoid churn). The `name` field in its `package.json` is the source of truth — Yarn Workspaces resolves by package name, not directory.
- **`@ccatto/ui` is the only package above 1.0.0** (currently 1.1.0). When making coordinated changes, only bump the packages you actually changed; the publish workflow keys off version, not commits.
- **`postinstall` runs `build:all`** so consumers and CI both get a fully built workspace after `yarn install`. Don't remove it without updating CI.
- **Peer deps are wide and mostly optional** (see `nest-auth`, `ui`) — keep new peer deps optional unless truly required, to avoid breaking consumers.
- **Resolutions** in root `package.json` pin `@typescript-eslint/*` and `better-call` — adjust with care.

## Important File Locations

- Root config: `/package.json`, `/turbo.json`, `/tsconfig.json`
- Workflows: `/.github/workflows/ci.yml`, `/.github/workflows/publish.yml`
- Publishing docs: `/docs/npm-publishing.md`
- Per-package entrypoints: `packages/<name>/src/index.ts`
- Per-package build configs: `tsup.config.ts` or `tsconfig.build.json`
- Per-package test configs: `vitest.config.ts` or `jest.config.js`
