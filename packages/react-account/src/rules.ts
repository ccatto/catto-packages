// @ccatto/react-account — account rules
//
// The phone-first safeguard. Use this SAME rule on the client (to block the
// Remove action) AND on the server (to authoritatively reject the mutation) so a
// phone-first user can never strip their only login credential and lock themselves
// out. See the README.
import type { AccountUser } from './types';

/** True when the user has at least one non-phone login method. */
export function hasOtherLoginMethod(
  methods: Pick<AccountUser, 'hasPassword' | 'hasOAuth' | 'hasPasskey'>,
): boolean {
  return Boolean(
    methods.hasPassword || methods.hasOAuth || methods.hasPasskey,
  );
}

/**
 * Whether it's safe to remove the user's phone number. False when phone is the
 * SOLE login method (removing it would lock the user out). Note: this doesn't
 * check that a phone exists — that's a separate UI concern.
 */
export function canRemovePhone(
  methods: Pick<AccountUser, 'hasPassword' | 'hasOAuth' | 'hasPasskey'>,
): boolean {
  return hasOtherLoginMethod(methods);
}

/**
 * Consent + opt-out copy for the phone-entry step. Apps that send OTP-only SMS
 * should show this near the number input (the package exports it so the copy stays
 * consistent). STOP is the carrier-level opt-out — no marketing list to unsubscribe.
 */
export const SMS_CONSENT_NOTICE =
  "We'll text a one-time code. Msg & data rates may apply. Reply STOP to opt out.";
