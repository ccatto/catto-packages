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

/**
 * The document kinds this package understands, as a runtime value. Consumers
 * (NestJS enums, Prisma seeds, validators) can iterate this instead of
 * re-declaring the union and risking drift.
 */
export const LEGAL_DOCUMENT_KINDS = ['TERMS', 'EULA', 'PRIVACY'] as const;

export type LegalDocumentKind = (typeof LEGAL_DOCUMENT_KINDS)[number];

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

/**
 * The minimal shape the comparison functions read: just `kind` + `version`.
 * A persisted `LegalAcceptanceRecord`, a `SubmittedAcceptance`, or a raw Prisma
 * row all satisfy this, so callers never fabricate an `acceptedAt` just to
 * check status.
 */
export type AcceptedLike = { kind: LegalDocumentKind; version: string };

/** True when `set` contains an entry matching the doc's kind AND exact version. */
function isCovered(
  doc: LegalDocumentVersion,
  set: ReadonlyArray<AcceptedLike>,
): boolean {
  return set.some((a) => a.kind === doc.kind && a.version === doc.version);
}

/**
 * Pure. The required documents the user has NOT accepted at the current version
 * (missing entirely, or accepted at a stale version).
 */
export function getUnacceptedDocuments(
  required: ReadonlyArray<LegalDocumentVersion>,
  accepted: ReadonlyArray<AcceptedLike>,
): LegalDocumentVersion[] {
  return required.filter((doc) => !isCovered(doc, accepted));
}

/** Pure. True if any required document is missing or stale. */
export function requiresReacceptance(
  required: ReadonlyArray<LegalDocumentVersion>,
  accepted: ReadonlyArray<AcceptedLike>,
): boolean {
  return getUnacceptedDocuments(required, accepted).length > 0;
}

/** The full acceptance status, shaped to map 1:1 onto a `legalStatus` GraphQL type. */
export interface LegalStatus {
  requiresReacceptance: boolean;
  unaccepted: LegalDocumentVersion[];
}

/**
 * Pure. Both answers a server's `legalStatus` query needs in one pass:
 * whether the user owes anything and exactly which documents.
 */
export function getLegalStatus(
  required: ReadonlyArray<LegalDocumentVersion>,
  accepted: ReadonlyArray<AcceptedLike>,
): LegalStatus {
  const unaccepted = getUnacceptedDocuments(required, accepted);
  return { requiresReacceptance: unaccepted.length > 0, unaccepted };
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
 * Robust type guard for `LegalAcceptanceError`. Prefer this over `instanceof`:
 * across a dual ESM/CJS build a consumer can end up with two copies of the class,
 * so `instanceof` may be false even for a genuine error. This checks the stable
 * `code` brand instead.
 */
export function isLegalAcceptanceError(e: unknown): e is LegalAcceptanceError {
  return (
    typeof e === 'object' &&
    e !== null &&
    (e as { code?: unknown }).code === 'LEGAL_ACCEPTANCE_REQUIRED'
  );
}

/**
 * Server-side guard. Throws `LegalAcceptanceError` (with `missing` populated) when
 * `submitted` does not cover every required document at its exact current version.
 * The app catches it and maps to a GraphQL error code (e.g. LEGAL_ACCEPTANCE_REQUIRED).
 * Unknown/extra submitted entries are ignored.
 */
export function assertAcceptanceValid(
  required: ReadonlyArray<LegalDocumentVersion>,
  submitted: ReadonlyArray<AcceptedLike>,
): void {
  const missing = required.filter((doc) => !isCovered(doc, submitted));
  if (missing.length > 0) {
    throw new LegalAcceptanceError(missing);
  }
}

/**
 * Optional boot-time sanity check for a `required` list. Throws on a duplicate
 * `kind` or a blank `version` so a config typo fails fast at startup rather than
 * silently mis-gating users. Not called automatically; invoke it where you define
 * your required documents.
 */
export function assertRequiredWellFormed(
  required: ReadonlyArray<LegalDocumentVersion>,
): void {
  const seen = new Set<LegalDocumentKind>();
  for (const doc of required) {
    if (!doc.version || doc.version.trim() === '') {
      throw new Error(
        `Invalid legal document: ${doc.kind} has a blank version.`,
      );
    }
    if (seen.has(doc.kind)) {
      throw new Error(`Duplicate legal document kind in required list: ${doc.kind}.`);
    }
    seen.add(doc.kind);
  }
}

/**
 * Convenience for the persist step: map submitted `{ kind, version }` entries to
 * `LegalAcceptanceRecord`s stamped with `at` (defaults to now). Keeps the
 * "write one row per accepted doc" mapping in one place.
 */
export function toAcceptanceRecords(
  submitted: ReadonlyArray<AcceptedLike>,
  at: Date = new Date(),
): LegalAcceptanceRecord[] {
  return submitted.map((s) => ({ kind: s.kind, version: s.version, acceptedAt: at }));
}
