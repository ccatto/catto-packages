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
  getUnacceptedDocuments,
  requiresReacceptance,
  assertAcceptanceValid,
  LegalAcceptanceError,
  type LegalDocumentKind,       // 'TERMS' | 'EULA' | 'PRIVACY'
  type LegalDocumentVersion,    // { kind, version, url }
  type LegalAcceptanceRecord,   // { kind, version, acceptedAt: Date }
  type SubmittedAcceptance,     // { kind, version }
} from '@ccatto/legal';

const required: LegalDocumentVersion[] = [
  { kind: 'TERMS',   version: '2026-08-15', url: '/legal/terms' },
  { kind: 'EULA',    version: '2026-08-15', url: '/legal/eula' },
  { kind: 'PRIVACY', version: '2026-08-15', url: '/legal/privacy' },
];

// What does an existing user still owe? (missing or stale versions)
const owed = getUnacceptedDocuments(required, user.legalAcceptances);
if (requiresReacceptance(required, user.legalAcceptances)) {
  // prompt for re-acceptance
}
```

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

## Notes

- Not legal advice. Confirm your Terms / EULA / Privacy content and your App Store
  obligations with counsel.
- The `url` on each document is whatever your in-app router understands; the package
  never navigates on its own.
