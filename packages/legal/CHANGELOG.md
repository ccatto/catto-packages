# Changelog

All notable changes to `@ccatto/legal` are documented here.

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
