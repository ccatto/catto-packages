// @ccatto/react-account
//
// Reusable, dual-auth-aware account settings: identity (slot), phone/SMS removal
// (with the phone-first safeguard), delete account, and blocked users. Transport-
// agnostic (inject async callbacks; no data client, no secrets) — mirrors
// @ccatto/react-comments. Pairs with @ccatto/auth-ui's UserProfileFormCatto.

export { AccountSettingsCatto } from './components/AccountSettingsCatto';
export type { AccountSettingsCattoProps } from './components/AccountSettingsCatto';

export { PhoneManagerCatto } from './components/PhoneManagerCatto';
export type { PhoneManagerCattoProps } from './components/PhoneManagerCatto';

export { DeleteAccountCatto } from './components/DeleteAccountCatto';
export type { DeleteAccountCattoProps } from './components/DeleteAccountCatto';

export { BlockedUsersCatto } from './components/BlockedUsersCatto';
export type { BlockedUsersCattoProps } from './components/BlockedUsersCatto';

// The phone-first safeguard rule (use on client AND server) + consent copy.
export { canRemovePhone, hasOtherLoginMethod, SMS_CONSENT_NOTICE } from './rules';

export {
  DEFAULT_PHONE_LABELS,
  DEFAULT_DELETE_LABELS,
  DEFAULT_BLOCKED_LABELS,
  DEFAULT_ACCOUNT_LABELS,
} from './labels';
export type {
  PhoneManagerLabels,
  DeleteAccountLabels,
  BlockedUsersLabels,
  AccountSettingsLabels,
} from './labels';

export type { AccountUser, BlockedUser } from './types';
