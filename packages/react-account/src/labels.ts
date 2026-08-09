// @ccatto/react-account — i18n label bags (override via the `labels` prop)

export interface PhoneManagerLabels {
  heading: string;
  noPhone: string;
  removeButton: string;
  removing: string;
  confirmPrompt: string;
  confirmRemove: string;
  cancel: string;
  soleMethodBlocked: string; // shown when phone is the only login method
  consentNotice: string;
  genericError: string;
}

export const DEFAULT_PHONE_LABELS: PhoneManagerLabels = {
  heading: 'Phone number',
  noPhone: 'No phone number on file.',
  removeButton: 'Remove phone number',
  removing: 'Removing…',
  confirmPrompt: 'Remove this phone number? You will stop receiving texts to it.',
  confirmRemove: 'Yes, remove it',
  cancel: 'Cancel',
  soleMethodBlocked:
    "This is your only way to sign in. Add a password or Google sign-in first, or delete your account.",
  consentNotice:
    "We'll text a one-time code. Msg & data rates may apply. Reply STOP to opt out.",
  genericError: 'Something went wrong. Please try again.',
};

export interface DeleteAccountLabels {
  heading: string;
  warning: string;
  confirmInstruction: string; // "{word}" replaced with the confirm word
  placeholder: string;
  deleteButton: string;
  deleting: string;
  genericError: string;
}

export const DEFAULT_DELETE_LABELS: DeleteAccountLabels = {
  heading: 'Delete account',
  warning:
    'This permanently deletes your account and all associated data. This cannot be undone.',
  confirmInstruction: 'Type {word} to confirm.',
  placeholder: 'DELETE',
  deleteButton: 'Delete my account',
  deleting: 'Deleting…',
  genericError: 'Something went wrong. Please try again.',
};

export interface BlockedUsersLabels {
  heading: string;
  empty: string;
  unblock: string;
  unblocking: string;
  loading: string;
  genericError: string;
}

export const DEFAULT_BLOCKED_LABELS: BlockedUsersLabels = {
  heading: 'Blocked users',
  empty: "You haven't blocked anyone.",
  unblock: 'Unblock',
  unblocking: 'Unblocking…',
  loading: 'Loading…',
  genericError: 'Something went wrong. Please try again.',
};

export interface AccountSettingsLabels {
  heading: string;
  identityHeading: string;
}

export const DEFAULT_ACCOUNT_LABELS: AccountSettingsLabels = {
  heading: 'Account settings',
  identityHeading: 'Profile',
};
