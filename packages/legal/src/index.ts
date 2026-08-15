// @ccatto/legal - core
//
// App-agnostic legal-acceptance mechanism (Terms/EULA/Privacy). This entry is
// PURE: types, comparison functions, and a server-side guard. Zero React, zero
// I/O, so it is safe to import in a NestJS backend. The React gate lives behind
// the `@ccatto/legal/react` subpath.
//
// Version strategy: a document's `version` is an ISO date string compared for
// EQUALITY (not semver, not ordering). Any change to legal text is a new version
// that requires fresh acceptance. "Minor changes skip re-acceptance" is a legal
// judgment, not a code one, and is intentionally NOT implemented here.

export type LegalDocumentKind = 'TERMS' | 'EULA' | 'PRIVACY';

export interface LegalDocumentVersion {
  kind: LegalDocumentKind;
  /** ISO date string, e.g. '2026-08-14'. */
  version: string;
  /** App-supplied route, e.g. '/legal/terms'. */
  url: string;
}

export interface LegalAcceptanceRecord {
  kind: LegalDocumentKind;
  version: string;
  acceptedAt: Date;
}

export interface SubmittedAcceptance {
  kind: LegalDocumentKind;
  version: string;
}

/** True when `set` contains an entry matching the doc's kind AND exact version. */
function isCovered(
  doc: LegalDocumentVersion,
  set: ReadonlyArray<{ kind: LegalDocumentKind; version: string }>,
): boolean {
  return set.some((a) => a.kind === doc.kind && a.version === doc.version);
}

/**
 * Pure. The required documents the user has NOT accepted at the current version
 * (missing entirely, or accepted at a stale version).
 */
export function getUnacceptedDocuments(
  required: LegalDocumentVersion[],
  accepted: LegalAcceptanceRecord[],
): LegalDocumentVersion[] {
  return required.filter((doc) => !isCovered(doc, accepted));
}

/** Pure. True if any required document is missing or stale. */
export function requiresReacceptance(
  required: LegalDocumentVersion[],
  accepted: LegalAcceptanceRecord[],
): boolean {
  return getUnacceptedDocuments(required, accepted).length > 0;
}

/** Thrown by `assertAcceptanceValid` when the submitted set is incomplete/stale. */
export class LegalAcceptanceError extends Error {
  readonly code = 'LEGAL_ACCEPTANCE_REQUIRED' as const;
  readonly missing: LegalDocumentVersion[];

  constructor(missing: LegalDocumentVersion[]) {
    super('Legal acceptance required: missing or stale document(s).');
    this.name = 'LegalAcceptanceError';
    this.missing = missing;
    // Restore the prototype chain (extending Error across transpilation targets).
    Object.setPrototypeOf(this, LegalAcceptanceError.prototype);
  }
}

/**
 * Server-side guard. Throws `LegalAcceptanceError` (with `missing` populated) when
 * `submitted` does not cover every required document at its exact current version.
 * The app catches it and maps to a GraphQL error code (e.g. LEGAL_ACCEPTANCE_REQUIRED).
 * Unknown/extra submitted entries are ignored.
 */
export function assertAcceptanceValid(
  required: LegalDocumentVersion[],
  submitted: SubmittedAcceptance[],
): void {
  const missing = required.filter((doc) => !isCovered(doc, submitted));
  if (missing.length > 0) {
    throw new LegalAcceptanceError(missing);
  }
}
