// @ccatto/react-account — AccountSettingsCatto
//
// Composed "manage my account" panel. Identity is a SLOT — pass your identity form
// (e.g. auth-ui's <UserProfileFormCatto/>) so this package stays free of next-intl.
// Prefer arranging the exported parts directly if you need a custom layout.
'use client';

import React from 'react';
import type { AccountUser, BlockedUser } from '../types';
import {
  DEFAULT_ACCOUNT_LABELS,
  type AccountSettingsLabels,
  type BlockedUsersLabels,
  type DeleteAccountLabels,
  type PhoneManagerLabels,
} from '../labels';
import { PhoneManagerCatto } from './PhoneManagerCatto';
import { DeleteAccountCatto } from './DeleteAccountCatto';
import { BlockedUsersCatto } from './BlockedUsersCatto';

export interface AccountSettingsCattoProps {
  currentUser: AccountUser;

  /** Your identity editor, e.g. <UserProfileFormCatto/> from @ccatto/auth-ui. */
  identitySlot?: React.ReactNode;

  // Phone
  onRemovePhone: () => Promise<void> | void;
  smsPreferences?: React.ReactNode;

  // Blocked users
  fetchBlocked: () => Promise<BlockedUser[]>;
  onUnblock: (id: string) => Promise<void> | void;

  // Delete
  onDeleteAccount: () => Promise<void> | void;
  deleteConfirmWord?: string;

  labels?: {
    account?: Partial<AccountSettingsLabels>;
    phone?: Partial<PhoneManagerLabels>;
    blocked?: Partial<BlockedUsersLabels>;
    delete?: Partial<DeleteAccountLabels>;
  };
  className?: string;
  'data-testid'?: string;
}

export const AccountSettingsCatto: React.FC<AccountSettingsCattoProps> = ({
  currentUser,
  identitySlot,
  onRemovePhone,
  smsPreferences,
  fetchBlocked,
  onUnblock,
  onDeleteAccount,
  deleteConfirmWord,
  labels,
  className,
  'data-testid': testId,
}) => {
  const L = { ...DEFAULT_ACCOUNT_LABELS, ...labels?.account };

  return (
    <div
      className={['w-full space-y-8', className].filter(Boolean).join(' ')}
      data-testid={testId}
    >
      <h2 className="text-xl font-bold text-theme-text">{L.heading}</h2>

      {identitySlot != null && (
        <section className="space-y-3">{identitySlot}</section>
      )}

      <PhoneManagerCatto
        currentUser={currentUser}
        onRemovePhone={onRemovePhone}
        smsPreferences={smsPreferences}
        labels={labels?.phone}
      />

      <BlockedUsersCatto
        fetchBlocked={fetchBlocked}
        onUnblock={onUnblock}
        labels={labels?.blocked}
      />

      <DeleteAccountCatto
        onDelete={onDeleteAccount}
        confirmWord={deleteConfirmWord}
        labels={labels?.delete}
      />
    </div>
  );
};

export default AccountSettingsCatto;
