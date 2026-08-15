// @ccatto/legal/react - LegalAcceptanceGate
//
// A checkbox + "I agree to the <Terms> and <EULA>" line. Purely presentational and
// headless: no fetching, no provider assumptions, no hardcoded copy.
//
// Labels contract (documented): `agreePrefix` is the leading text; `separator`
// joins the links. The gate renders `{agreePrefix} {link0} {separator} {link1} …`
// where each link comes from `renderLink(doc)`. Links are rendered OUTSIDE the
// checkbox's <label>, so clicking a link navigates (in-app) instead of toggling.
'use client';

import React, { Fragment, useEffect, useId, useRef, useState } from 'react';
import type { LegalDocumentVersion } from '../index';
import type { AcceptedVersion } from './useLegalAcceptance';

export interface LegalAcceptanceLabels {
  /** Leading text, e.g. "I agree to the". */
  agreePrefix?: string;
  /** Text between links, e.g. "and". Default "and". */
  separator?: string;
}

export interface LegalAcceptanceGateProps {
  documents: LegalDocumentVersion[];
  /** Fired on every toggle with the current state + the versions to submit. */
  onChange: (accepted: boolean, versions: AcceptedVersion[]) => void;
  /** App-supplied link for a doc — must route IN-APP (not window.open). */
  renderLink: (doc: LegalDocumentVersion) => React.ReactNode;
  /** All user-facing strings (i18n). The package ships no English. */
  labels: LegalAcceptanceLabels;
  /**
   * Controlled mode: when provided, the checkbox reflects this value and the
   * component keeps no internal state. Omit for the default uncontrolled mode.
   */
  checked?: boolean;
  className?: string;
  /**
   * Accessible name for the checkbox. Since the document links sit OUTSIDE the
   * <label> (so clicks navigate rather than toggle), a screen reader otherwise
   * only hears `agreePrefix`. Supply e.g. "I agree to the Terms and EULA".
   */
  'aria-label'?: string;
  /** Id of an element describing the checkbox (e.g. the links container). */
  'aria-describedby'?: string;
  'data-testid'?: string;
}

const signatureOf = (documents: LegalDocumentVersion[]): string =>
  documents.map((d) => `${d.kind}:${d.version}`).join('|');

export const LegalAcceptanceGate: React.FC<LegalAcceptanceGateProps> = ({
  documents,
  onChange,
  renderLink,
  labels,
  checked,
  className,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'data-testid': testId,
}) => {
  // Unchecked by default — a pre-checked box is not affirmative consent.
  const [internalAccepted, setInternalAccepted] = useState(false);
  const isControlled = checked !== undefined;
  const accepted = isControlled ? checked : internalAccepted;
  const id = useId();
  const separator = labels.separator ?? 'and';

  // Correctness: when the required documents change (e.g. a version bump lands
  // during a re-acceptance flow), a previously-checked box no longer reflects
  // consent to the NEW set — reset it and tell the parent. Skipped in controlled
  // mode (the parent owns the value) and on the first render (no false onChange
  // on mount).
  const signature = signatureOf(documents);
  const prevSignatureRef = useRef(signature);
  useEffect(() => {
    if (isControlled) return;
    if (prevSignatureRef.current === signature) return;
    prevSignatureRef.current = signature;
    setInternalAccepted(false);
    onChange(false, []);
  }, [signature, isControlled, onChange]);

  const handleToggle = () => {
    const next = !accepted;
    if (!isControlled) setInternalAccepted(next);
    onChange(
      next,
      next ? documents.map((d) => ({ kind: d.kind, version: d.version })) : [],
    );
  };

  return (
    <div
      className={['flex items-start gap-2 text-sm', className]
        .filter(Boolean)
        .join(' ')}
    >
      <input
        id={id}
        type="checkbox"
        checked={accepted}
        onChange={handleToggle}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        data-testid={testId}
        className="mt-0.5 h-4 w-4 shrink-0"
      />
      <span>
        {labels.agreePrefix && <label htmlFor={id}>{labels.agreePrefix} </label>}
        {documents.map((doc, i) => (
          <Fragment key={`${doc.kind}:${doc.version}`}>
            {i > 0 && <span> {separator} </span>}
            {renderLink(doc)}
          </Fragment>
        ))}
      </span>
    </div>
  );
};

export default LegalAcceptanceGate;
