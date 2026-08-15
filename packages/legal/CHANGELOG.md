# Changelog

All notable changes to `@ccatto/legal` are documented here.

## 1.1.0

DX and correctness refinements. All additive and backward-compatible.

- **Loosened comparison inputs.** `getUnacceptedDocuments`, `requiresReacceptance`,
  and `assertAcceptanceValid` now accept any `ReadonlyArray<{ kind, version }>`
  (exported as `AcceptedLike`) — pass raw Prisma rows or client input without
  fabricating an `acceptedAt` Date.
- **`getLegalStatus(required, accepted)`** returns `{ requiresReacceptance,
  unaccepted }` in one call (plus the `LegalStatus` type), mapping 1:1 onto a
  `legalStatus` query.
- **`LEGAL_DOCUMENT_KINDS`** runtime const (`['TERMS','EULA','PRIVACY'] as const`);
  `LegalDocumentKind` is now derived from it, so consumers stop re-declaring the enum.
- **`isLegalAcceptanceError(e)`** type guard — prefer it over `instanceof`, which can
  fail across the dual ESM/CJS build; it checks the stable `code` brand.
- **`assertRequiredWellFormed(required)`** optional boot-time check that throws on a
  duplicate kind or blank version.
- **`toAcceptanceRecords(submitted, at?)`** maps submitted entries to
  `LegalAcceptanceRecord`s for the persist step.
- **Gate: resets on document change.** In uncontrolled mode the checkbox now resets
  to unchecked and fires `onChange(false, [])` when `documents` change (e.g. a version
  bump mid re-acceptance) — a previously-checked box no longer reports stale consent.
- **Gate: controlled mode** via the new optional `checked` prop.
- **Gate: accessibility** via new optional `aria-label` / `aria-describedby` props so
  screen readers announce the document names (the links live outside the `<label>`).
- README: recommended Prisma model, framework/Capacitor notes, `getLegalStatus` and
  error-guard usage.

## 1.0.0

Initial release.

- Dual entry points: `@ccatto/legal` (React-free core, Nest-safe) and
  `@ccatto/legal/react` (headless hook + presentational gate). `react` is an
  optional peer dependency.
- Core: `LegalDocumentKind`, `LegalDocumentVersion`, `LegalAcceptanceRecord`,
  `SubmittedAcceptance` types; `getUnacceptedDocuments`, `requiresReacceptance`,
  and the `assertAcceptanceValid` server guard (throws `LegalAcceptanceError` with
  `code` and `missing`).
- Versioning by exact-string equality — any change to a document's version string
  requires re-acceptance; no "minor change" skip path.
- React: `<LegalAcceptanceGate>` (unchecked by default, app-supplied in-app
  `renderLink`, all copy via `labels`) and `useLegalAcceptance` headless state.
