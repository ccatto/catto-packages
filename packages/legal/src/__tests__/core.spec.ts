import { describe, expect, it } from 'vitest';
import {
  assertAcceptanceValid,
  getUnacceptedDocuments,
  LegalAcceptanceError,
  requiresReacceptance,
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
