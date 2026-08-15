# @ccatto/legal

App-agnostic legal acceptance (Terms / EULA / Privacy) for Catto apps. Satisfies
Apple App Store Guideline 1.2 item 5 (user-generated-content apps must have users
agree to terms and an EULA) by giving you a versioned acceptance mechanism you can
enforce on the client, in signup, and on the server.

The package ships **two entry points** so a NestJS backend can import the core
without pulling React into its dependency graph:

| Import | Contents | React? |
|--------|----------|--------|
| `@ccatto/legal` | Types, pure functions, and the server-side guard. Zero React, zero I/O. Safe in Nest. | no |
| `@ccatto/legal/react` | A headless hook and a presentational gate component. | yes (peer) |

`react` is an **optional peer dependency** — main-entry consumers never install it.

## What this package is (and is not)

It is the reusable **mechanism**: how to model "which document versions must be
accepted", how to compute what a user still owes, and how to render an affirmative
consent checkbox without baking in any copy, routing, or storage.

It is **not** the policy or the plumbing. Your app owns:

- The legal prose (the Terms / EULA / Privacy documents themselves).
- The persistence model (e.g. a Prisma `LegalAcceptance` row) and the mutation that
  writes it.
- The signup / settings UI wiring and the in-app routes the links point at.

## Versioning model: exact-string equality

A document version is an **opaque string** — we recommend an ISO date such as
`"2026-08-15"`. Acceptance is checked by **exact equality**, not ordering:

- If the required version differs at all from what the user accepted, they must
  re-accept. Any change is a new version.
- There is deliberately **no** "this change was minor, skip re-acceptance" path. If
  a change does not warrant re-acceptance, do not bump the version string.

This keeps the rule trivial to reason about and to enforce identically on client and
server.

## Core API (`@ccatto/legal`)

```ts
import {
  LEGAL_DOCUMENT_KINDS,         // ['TERMS','EULA','PRIVACY'] as const (runtime)
  getUnacceptedDocuments,
  requiresReacceptance,
  getLegalStatus,               // { requiresReacceptance, unaccepted } in one call
  assertAcceptanceValid,        // server guard (throws)
  assertRequiredWellFormed,     // optional boot-time config check
  toAcceptanceRecords,          // map submitted -> rows to persist
  LegalAcceptanceError,
  isLegalAcceptanceError,       // robust guard (prefer over instanceof)
  type LegalDocumentKind,       // 'TERMS' | 'EULA' | 'PRIVACY'
  type LegalDocumentVersion,    // { kind, version, url }
  type LegalAcceptanceRecord,   // { kind, version, acceptedAt: Date }
  type SubmittedAcceptance,     // { kind, version }
  type AcceptedLike,            // { kind, version } — the minimal read shape
  type LegalStatus,             // { requiresReacceptance, unaccepted }
} from '@ccatto/legal';

const required: LegalDocumentVersion[] = [
  { kind: 'TERMS',   version: '2026-08-15', url: '/legal/terms' },
  { kind: 'EULA',    version: '2026-08-15', url: '/legal/eula' },
  { kind: 'PRIVACY', version: '2026-08-15', url: '/legal/privacy' },
];
assertRequiredWellFormed(required); // optional: fail fast on dup kind / blank version

// What does an existing user still owe? (missing or stale versions)
const owed = getUnacceptedDocuments(required, user.legalAcceptances);
if (requiresReacceptance(required, user.legalAcceptances)) {
  // prompt for re-acceptance
}
```

### `getLegalStatus` — one call for a `legalStatus` resolver

`getUnacceptedDocuments` + `requiresReacceptance` in a single pass, shaped 1:1 for a
GraphQL/REST status endpoint:

```ts
const status = getLegalStatus(required, user.legalAcceptances);
// -> { requiresReacceptance: boolean, unaccepted: LegalDocumentVersion[] }
return status;
```

### Loose inputs — pass raw rows, no fabricated `Date`

The comparison functions (`getUnacceptedDocuments`, `requiresReacceptance`,
`getLegalStatus`, `assertAcceptanceValid`) read only `kind` + `version` (the
`AcceptedLike` shape). Pass persisted `LegalAcceptanceRecord`s, `SubmittedAcceptance`
client input, or **raw Prisma rows** directly — you never need to invent an
`acceptedAt` just to check status.

### Server-side guard

Enforce acceptance in your mutation resolver. Import the core entry — no React is
pulled in:

```ts
import { assertAcceptanceValid, LegalAcceptanceError } from '@ccatto/legal';

try {
  // `submitted` is what the client sent: Array<{ kind, version }>
  assertAcceptanceValid(required, submitted);
} catch (err) {
  if (err instanceof LegalAcceptanceError) {
    // err.code === 'LEGAL_ACCEPTANCE_REQUIRED'
    // err.missing is the LegalDocumentVersion[] the client failed to cover
    throw new BadRequestException({ code: err.code, missing: err.missing });
  }
  throw err;
}
```

`assertAcceptanceValid` throws `LegalAcceptanceError` when any required document is
not covered by an exact `{ kind, version }` match in `submitted`. Extra/unknown
submitted entries are ignored.

**Prefer `isLegalAcceptanceError(err)` over `err instanceof LegalAcceptanceError`.**
Across the dual ESM/CJS build a consumer can end up with two copies of the class, so
`instanceof` may be false for a genuine error. The guard checks the stable
`err.code === 'LEGAL_ACCEPTANCE_REQUIRED'` brand instead.

### Persisting acceptances

After the guard passes, write one row per accepted document. `toAcceptanceRecords`
does the mapping (stamps `acceptedAt`, defaulting to now):

```ts
import { assertAcceptanceValid, toAcceptanceRecords } from '@ccatto/legal';

assertAcceptanceValid(required, submitted);
await prisma.legalAcceptance.createMany({
  data: toAcceptanceRecords(submitted).map((r) => ({ ...r, userId })),
  skipDuplicates: true,
});
```

## React API (`@ccatto/legal/react`)

### `<LegalAcceptanceGate>` — presentational consent checkbox

```tsx
import { LegalAcceptanceGate } from '@ccatto/legal/react';
import Link from 'next/link';

<LegalAcceptanceGate
  documents={required}
  onChange={(accepted, versions) => setLegal(accepted ? versions : [])}
  // App-supplied link — MUST route IN-APP. Do not use window.open: on Capacitor
  // that leaves the app. Use your router's Link so the webview navigates.
  renderLink={(doc) => <Link href={doc.url}>{labelFor(doc.kind)}</Link>}
  labels={{ agreePrefix: 'I agree to the', separator: 'and' }}
/>;
```

- **Unchecked by default.** A pre-checked box is not affirmative consent.
- **Purely presentational.** No fetching, no provider, no hardcoded copy. Every
  user-facing string comes from `labels` or from your `renderLink` output, so the
  component is fully i18n-able and ships no English of its own.
- **Links route in-app.** You supply `renderLink`; render your framework's link so
  navigation stays inside the app (critical for Capacitor webviews). Links are
  rendered outside the checkbox label, so clicking a link navigates instead of
  toggling the box.
- `onChange(accepted, versions)` fires on every toggle. `versions` is the
  `{ kind, version }[]` to submit while checked, and `[]` when unchecked.
- **Resets on document change.** In uncontrolled mode, if `documents` change
  identity (a version bump lands during a re-acceptance flow), the box resets to
  unchecked and fires `onChange(false, [])` — a previously-checked box no longer
  reflects consent to the new set. (Not on first mount; no false `onChange` there.)
- **Controlled mode.** Pass `checked` to drive the box from parent state (the
  component then keeps no internal state); the click still calls `onChange`.
- **Accessibility.** Because the links sit outside the `<label>` (so a click
  navigates instead of toggling), pass `aria-label` (e.g. `"I agree to the Terms and
  EULA"`) and/or `aria-describedby` so a screen reader announces the document names.

### `useLegalAcceptance` — headless state

Build your own UI and take just the state machine:

```tsx
import { useLegalAcceptance } from '@ccatto/legal/react';

const { accepted, acceptedVersions, toggle } = useLegalAcceptance(required);
```

Same semantics: unchecked by default, `acceptedVersions` is populated only while
`accepted` is true.

## End-to-end wiring (recommended)

1. Define your `required: LegalDocumentVersion[]` in one place (client and server
   import the same list, or the server is the source of truth and the client reads
   it).
2. Render `<LegalAcceptanceGate>` in signup; block submit until `accepted`.
3. Send `acceptedVersions` with the signup/accept mutation.
4. In the resolver, call `assertAcceptanceValid(required, submitted)` before writing,
   then persist one `LegalAcceptanceRecord` per accepted document.
5. For existing users, gate protected actions with
   `requiresReacceptance(required, user.legalAcceptances)` and re-prompt when a
   version bumps.

## Recommended persistence model (Prisma)

The package is storage-agnostic, but the natural model is one row per accepted
document, unique per `(user, kind, version)`:

```prisma
model LegalAcceptance {
  id         String   @id @default(cuid())
  userId     String
  kind       String   // 'TERMS' | 'EULA' | 'PRIVACY' — see LEGAL_DOCUMENT_KINDS
  version    String   // exact-equality version string, e.g. '2026-08-15'
  acceptedAt DateTime @default(now())
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, kind, version])
  @@index([userId])
}
```

The `@@unique([userId, kind, version])` lets you `createMany({ skipDuplicates: true })`
without racing on re-submits. Use `LEGAL_DOCUMENT_KINDS` to seed/validate the `kind`
enum rather than re-typing the strings.

## Framework notes

- **In-app routing (Capacitor).** `renderLink` MUST route in-app. Never use
  `window.open` or a plain `<a target="_blank">` — on Capacitor that leaves the app
  (opens the system browser) and breaks the signup flow. Use your router's `Link`.
- **`url` can be a route key.** It is passed straight to your `renderLink`, so it can
  be a locale-resolved key or an internal route id, not just a literal path — the
  package never navigates on its own.
- **Next.js App Router.** `@ccatto/legal/react` is a client entry (ships
  `"use client"`). If your bundler does not transpile `node_modules` by default, add
  the package to `transpilePackages` in `next.config.js`. The core `@ccatto/legal`
  entry is server-safe and needs nothing.

## Notes

- Not legal advice. Confirm your Terms / EULA / Privacy content and your App Store
  obligations with counsel.
- The `url` on each document is whatever your in-app router understands; the package
  never navigates on its own.
