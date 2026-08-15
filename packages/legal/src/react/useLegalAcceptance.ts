// @ccatto/legal/react - useLegalAcceptance
//
// Headless acceptance state for apps that want to build their own UI. Unchecked
// by default (a pre-checked box is not affirmative consent). `acceptedVersions`
// is the set to submit once `accepted` is true, else empty.
import { useCallback, useMemo, useState } from 'react';
import type { LegalDocumentKind, LegalDocumentVersion } from '../index';

export interface AcceptedVersion {
  kind: LegalDocumentKind;
  version: string;
}

export interface UseLegalAcceptanceReturn {
  accepted: boolean;
  /** The kinds+versions to submit — populated only while `accepted` is true. */
  acceptedVersions: AcceptedVersion[];
  toggle: () => void;
}

export function useLegalAcceptance(
  documents: LegalDocumentVersion[],
): UseLegalAcceptanceReturn {
  const [accepted, setAccepted] = useState(false);
  const toggle = useCallback(() => setAccepted((a) => !a), []);

  const acceptedVersions = useMemo<AcceptedVersion[]>(
    () =>
      accepted
        ? documents.map((d) => ({ kind: d.kind, version: d.version }))
        : [],
    [accepted, documents],
  );

  return { accepted, acceptedVersions, toggle };
}
