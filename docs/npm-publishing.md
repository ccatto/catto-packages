# npm Publishing Setup

All `@ccatto/*` packages are published to [npmjs.com](https://www.npmjs.com/settings/ccatto/packages) under the `catto` organization.

## npm Account

- **Username:** ccatto
- **Scope:** `@ccatto` (tied to npm username `ccatto`)
- **Packages page:** https://www.npmjs.com/settings/ccatto/packages

## NPM_TOKEN (Granular Access Token)

The GitHub Actions publish workflow uses an `NPM_TOKEN` secret to authenticate with npm.

### Token settings

| Setting | Value |
|---------|-------|
| **Token name** | `NPM_TOKEN` |
| **Description** | Automation token for publishing @ccatto/* packages to npmjs.com |
| **Expiration** | 90 days (maximum for granular tokens) |
| **Packages and scopes** | Read and write |
| **Organizations** | No access |
| **IP ranges** | Blank (GitHub Actions uses dynamic IPs) |
| **Bypass 2FA** | No (unchecked) |

### Where it's stored

The token is added as a repository secret in GitHub:

**GitHub repo** > Settings > Secrets and variables > Actions > `NPM_TOKEN`

### Token rotation

Granular access tokens expire after **90 days** (max). Set a calendar reminder to rotate before expiration.

**To rotate:**

1. Go to https://www.npmjs.com/settings/ccatto/tokens
2. Generate a new Granular Access Token with the same settings above
3. Go to https://github.com/ccatto/catto-packages/settings/secrets/actions
4. Update the `NPM_TOKEN` secret with the new token value
5. Delete the old token from npm

## GitHub Actions & Workflows

**GitHub Actions** is GitHub's built-in CI/CD platform — it runs automation in response to repository events (pushes, PRs, schedules, etc.).

A **workflow** is a single automation defined as a `.yml` file in `.github/workflows/`. Each workflow contains **jobs**, and each job contains **steps**. Think of Actions as the engine, and workflows as the programs that run on it.

### Our workflows

We have two workflows:

| Workflow | File | Trigger | Purpose |
|----------|------|---------|---------|
| **CI** | `.github/workflows/ci.yml` | Pull requests to `main` | Builds all packages and runs tests. Validates code before merge. |
| **Publish Packages** | `.github/workflows/publish.yml` | Push to `main` (when `packages/**` changes) | Builds all packages, then publishes any with unpublished versions to npm. |

**Flow:** Open PR → CI runs (build + test) → Merge to main → Publish Packages runs → new versions go live on npm.

## How publishing works

The `.github/workflows/publish.yml` workflow:

1. Triggers on push to `main` when files under `packages/` change
2. Installs dependencies and builds all packages via Turborepo
3. For each package, checks if the current version is already published on npm
4. If not published, runs `npm publish` (with `"access": "public"` from `publishConfig`)

**To publish a new version:**

1. Bump the version in the package's `package.json`
2. Merge to `main`
3. The workflow automatically publishes the new version

## Local publishing (manual)

If you need to publish manually:

```bash
# Login to npm (one-time)
npm login

# Build the package
yarn build

# Publish from the package directory
cd packages/<package-name>
npm publish
```

## Consumer setup

Since packages are on the public npm registry, consumers just install normally:

```bash
npm install @ccatto/nest-auth
```

No `.npmrc` configuration or special auth needed.
