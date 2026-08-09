// @ccatto/react-account — PhoneManagerCatto
//
// View + REMOVE your phone number. Compliance-driven (OTP-only apps):
//  - The real control is "Remove phone number" (stops all texts to it).
//  - PHONE-FIRST SAFEGUARD: if phone is the user's only login method, removal is
//    blocked here — and the app MUST also reject it server-side (never strip the
//    only credential). See `canRemovePhone` + the README.
//  - No marketing opt-in/out UI (STOP is the carrier-level opt-out). An optional
//    `smsPreferences` slot is hidden unless an app that adds non-OTP SMS provides it.
'use client';

import React, { useState } from 'react';
import { PhoneDisplayCatto } from '@ccatto/ui';
import type { AccountUser } from '../types';
import { canRemovePhone } from '../rules';
import { DEFAULT_PHONE_LABELS, type PhoneManagerLabels } from '../labels';

export interface PhoneManagerCattoProps {
  currentUser: AccountUser;
  /** Clears the phone server-side. The app MUST also enforce `canRemovePhone`. */
  onRemovePhone: () => Promise<void> | void;
  /** Optional non-OTP SMS preferences UI. Hidden unless provided (OTP-only default). */
  smsPreferences?: React.ReactNode;
  labels?: Partial<PhoneManagerLabels>;
  className?: string;
  'data-testid'?: string;
}

export const PhoneManagerCatto: React.FC<PhoneManagerCattoProps> = ({
  currentUser,
  onRemovePhone,
  smsPreferences,
  labels,
  className,
  'data-testid': testId,
}) => {
  const L = { ...DEFAULT_PHONE_LABELS, ...labels };
  const [confirming, setConfirming] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phone = currentUser.phone;
  const removable = canRemovePhone(currentUser);

  const handleRemove = async () => {
    setRemoving(true);
    setError(null);
    try {
      await onRemovePhone();
      setConfirming(false);
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : L.genericError);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <section
      className={['w-full space-y-3', className].filter(Boolean).join(' ')}
      data-testid={testId}
    >
      <h3 className="text-base font-semibold text-theme-text">{L.heading}</h3>

      {!phone ? (
        <p className="text-sm text-theme-text-muted">{L.noPhone}</p>
      ) : (
        <>
          <PhoneDisplayCatto
            value={phone}
            format="international"
            className="text-sm text-theme-text"
          />

          {!removable ? (
            <p
              role="note"
              className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200"
            >
              {L.soleMethodBlocked}
            </p>
          ) : !confirming ? (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="rounded-lg border border-theme-border px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 dark:hover:bg-red-900/20"
            >
              {L.removeButton}
            </button>
          ) : (
            <div className="space-y-2 rounded-lg border border-theme-border p-3">
              <p className="text-sm text-theme-text">{L.confirmPrompt}</p>
              {error && (
                <p role="alert" className="text-xs text-red-500">
                  {error}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={removing}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {removing ? L.removing : L.confirmRemove}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  disabled={removing}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-theme-text-muted hover:bg-theme-surface-secondary"
                >
                  {L.cancel}
                </button>
              </div>
            </div>
          )}

          <p className="text-xs text-theme-text-muted">{L.consentNotice}</p>
        </>
      )}

      {/* Off by default: only rendered when an app supplies non-OTP SMS prefs. */}
      {smsPreferences}
    </section>
  );
};

export default PhoneManagerCatto;
