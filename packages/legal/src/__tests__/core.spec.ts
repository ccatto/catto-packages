import { describe, expect, it } from 'vitest';
import {
  assertAcceptanceValid,
  assertRequiredWellFormed,
  getLegalStatus,
  getUnacceptedDocuments,
  isLegalAcceptanceError,
  LEGAL_DOCUMENT_KINDS,
  LegalAcceptanceError,
  requiresReacceptance,
  toAcceptanceRecords,
  type LegalAcceptanceRecord,
  type LegalDocumentVersion,
} from '../index';

const required: LegalDocumentVersion[] = [
  { kind: 'TERMS', version: '2026-08-14', url: '/legal/terms' },
  { kind: 'EULA', version: '2026-08-14', url: '/legal/eula' },
];

const rec = (
  kind: 'TERMS' | 'EULA' | 'PRIVACY',
  version: string,
): LegalAcceptanceRecord => ({ kind, version, acceptedAt: new Date(0) });

describe('getUnacceptedDocuments', () => {
  it('returns [] when all required docs are accepted at the current version', () => {
    const accepted = [rec('TERMS', '2026-08-14'), rec('EULA', '2026-08-14')];
    expect(getUnacceptedDocuments(required, accepted)).toEqual([]);
  });

  it('returns a doc that was never accepted', () => {
    const accepted = [rec('TERMS', '2026-08-14')]; // EULA missing
    expect(getUnacceptedDocuments(required, accepted)).toEqual([
      { kind: 'EULA', version: '2026-08-14', url: '/legal/eula' },
    ]);
  });

  it('treats a STALE version as unaccepted (equality, not ordering)', () => {
    const accepted = [rec('TERMS', '2026-01-01'), rec('EULA', '2026-08-14')];
    expect(getUnacceptedDocuments(required, accepted).map((d) => d.kind)).toEqual([
      'TERMS',
    ]);
  });

  it('ignores accepted docs that are not required', () => {
    const accepted = [
      rec('TERMS', '2026-08-14'),
      rec('EULA', '2026-08-14'),
      rec('PRIVACY', '2026-08-14'), // not required
    ];
    expect(getUnacceptedDocuments(required, accepted)).toEqual([]);
  });
});

describe('requiresReacceptance', () => {
  it('is false when current, true when missing/stale', () => {
    expect(
      requiresReacceptance(required, [
        rec('TERMS', '2026-08-14'),
        rec('EULA', '2026-08-14'),
      ]),
    ).toBe(false);
    expect(requiresReacceptance(required, [rec('TERMS', '2026-08-14')])).toBe(
      true,
    );
  });
});

describe('assertAcceptanceValid', () => {
  it('passes when the submitted set matches every required doc exactly', () => {
    expect(() =>
      assertAcceptanceValid(required, [
        { kind: 'TERMS', version: '2026-08-14' },
        { kind: 'EULA', version: '2026-08-14' },
      ]),
    ).not.toThrow();
  });

  it('throws LegalAcceptanceError with `missing` for an absent doc', () => {
    try {
      assertAcceptanceValid(required, [{ kind: 'TERMS', version: '2026-08-14' }]);
      throw new Error('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(LegalAcceptanceError);
      const e = err as LegalAcceptanceError;
      expect(e.code).toBe('LEGAL_ACCEPTANCE_REQUIRED');
      expect(e.missing.map((d) => d.kind)).toEqual(['EULA']);
    }
  });

  it('throws for a stale submitted version', () => {
    expect(() =>
      assertAcceptanceValid(required, [
        { kind: 'TERMS', version: '2026-08-14' },
        { kind: 'EULA', version: '2020-01-01' },
      ]),
    ).toThrow(LegalAcceptanceError);
  });

  it('ignores extra/unknown submitted docs', () => {
    expect(() =>
      assertAcceptanceValid(required, [
        { kind: 'TERMS', version: '2026-08-14' },
        { kind: 'EULA', version: '2026-08-14' },
        { kind: 'PRIVACY', version: '2026-08-14' },
      ]),
    ).not.toThrow();
  });
});

describe('comparison fns accept a bare { kind, version } shape', () => {
  it('works without fabricating an acceptedAt Date (e.g. raw Prisma rows)', () => {
    const rows = [
      { kind: 'TERMS' as const, version: '2026-08-14' },
      { kind: 'EULA' as const, version: '2026-08-14' },
    ];
    expect(getUnacceptedDocuments(required, rows)).toEqual([]);
    expect(requiresReacceptance(required, rows)).toBe(false);
  });
});

describe('getLegalStatus', () => {
  it('returns requiresReacceptance + the unaccepted list in one pass', () => {
    expect(getLegalStatus(required, [rec('TERMS', '2026-08-14')])).toEqual({
      requiresReacceptance: true,
      unaccepted: [{ kind: 'EULA', version: '2026-08-14', url: '/legal/eula' }],
    });
    expect(
      getLegalStatus(required, [
        rec('TERMS', '2026-08-14'),
        rec('EULA', '2026-08-14'),
      ]),
    ).toEqual({ requiresReacceptance: false, unaccepted: [] });
  });
});

describe('LEGAL_DOCUMENT_KINDS', () => {
  it('is the runtime tuple backing the LegalDocumentKind type', () => {
    expect(LEGAL_DOCUMENT_KINDS).toEqual(['TERMS', 'EULA', 'PRIVACY']);
  });
});

describe('isLegalAcceptanceError', () => {
  it('recognizes the error by its code brand (survives dual-build class identity)', () => {
    expect(isLegalAcceptanceError(new LegalAcceptanceError([]))).toBe(true);
    // A structurally-branded plain object (e.g. deserialized across a boundary).
    expect(isLegalAcceptanceError({ code: 'LEGAL_ACCEPTANCE_REQUIRED' })).toBe(
      true,
    );
    expect(isLegalAcceptanceError(new Error('nope'))).toBe(false);
    expect(isLegalAcceptanceError(null)).toBe(false);
    expect(isLegalAcceptanceError('LEGAL_ACCEPTANCE_REQUIRED')).toBe(false);
  });
});

describe('assertRequiredWellFormed', () => {
  it('passes a clean list', () => {
    expect(() => assertRequiredWellFormed(required)).not.toThrow();
  });

  it('throws on a duplicate kind', () => {
    expect(() =>
      assertRequiredWellFormed([
        { kind: 'TERMS', version: '2026-08-14', url: '/a' },
        { kind: 'TERMS', version: '2026-08-15', url: '/b' },
      ]),
    ).toThrow(/Duplicate/);
  });

  it('throws on a blank version', () => {
    expect(() =>
      assertRequiredWellFormed([{ kind: 'TERMS', version: '  ', url: '/a' }]),
    ).toThrow(/blank version/);
  });
});

describe('toAcceptanceRecords', () => {
  it('stamps submitted entries with the given Date', () => {
    const at = new Date('2026-08-15T00:00:00.000Z');
    expect(
      toAcceptanceRecords([{ kind: 'TERMS', version: '2026-08-14' }], at),
    ).toEqual([{ kind: 'TERMS', version: '2026-08-14', acceptedAt: at }]);
  });
});
