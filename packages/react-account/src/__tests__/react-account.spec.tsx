import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { canRemovePhone, hasOtherLoginMethod, SMS_CONSENT_NOTICE } from '../rules';
import { PhoneManagerCatto } from '../components/PhoneManagerCatto';
import { DeleteAccountCatto } from '../components/DeleteAccountCatto';
import { BlockedUsersCatto } from '../components/BlockedUsersCatto';
import type { AccountUser, BlockedUser } from '../types';

describe('canRemovePhone / hasOtherLoginMethod', () => {
  it('is false when phone is the sole login method', () => {
    expect(canRemovePhone({})).toBe(false);
    expect(canRemovePhone({ hasPassword: false, hasOAuth: false })).toBe(false);
  });
  it('is true when any other method exists', () => {
    expect(canRemovePhone({ hasPassword: true })).toBe(true);
    expect(canRemovePhone({ hasOAuth: true })).toBe(true);
    expect(hasOtherLoginMethod({ hasPasskey: true })).toBe(true);
  });
});

const phoneUser = (over: Partial<AccountUser> = {}): AccountUser => ({
  id: 'u1',
  phone: '+12025551234',
  ...over,
});

describe('PhoneManagerCatto — phone-first safeguard', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('BLOCKS removal when phone is the only login method', () => {
    const onRemovePhone = vi.fn();
    render(
      <PhoneManagerCatto
        currentUser={phoneUser({ hasPassword: false, hasOAuth: false, hasPasskey: false })}
        onRemovePhone={onRemovePhone}
      />,
    );
    // No remove button; a blocking note instead.
    expect(screen.queryByRole('button', { name: /remove phone/i })).toBeNull();
    expect(screen.getByText(/only way to sign in/i)).toBeTruthy();
    // STOP/consent notice is always shown when a phone is present.
    expect(screen.getByText(new RegExp('Reply STOP', 'i'))).toBeTruthy();
  });

  it('ALLOWS removal (confirm → onRemovePhone) when another method exists', async () => {
    const onRemovePhone = vi.fn().mockResolvedValue(undefined);
    render(
      <PhoneManagerCatto
        currentUser={phoneUser({ hasPassword: true })}
        onRemovePhone={onRemovePhone}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /remove phone number/i }));
    fireEvent.click(screen.getByRole('button', { name: /yes, remove it/i }));
    await waitFor(() => expect(onRemovePhone).toHaveBeenCalledTimes(1));
  });

  it('shows the empty state when there is no phone', () => {
    render(
      <PhoneManagerCatto currentUser={{ id: 'u1' }} onRemovePhone={vi.fn()} />,
    );
    expect(screen.getByText(/no phone number on file/i)).toBeTruthy();
  });
});

describe('DeleteAccountCatto', () => {
  it('enables delete only when the confirm word matches exactly', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    render(<DeleteAccountCatto onDelete={onDelete} />);
    const btn = screen.getByRole('button', { name: /delete my account/i });
    expect((btn as HTMLButtonElement).disabled).toBe(true);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'delete' } }); // wrong case
    expect((btn as HTMLButtonElement).disabled).toBe(true);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'DELETE' } });
    expect((btn as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(btn);
    await waitFor(() => expect(onDelete).toHaveBeenCalledTimes(1));
  });
});

describe('BlockedUsersCatto', () => {
  const blocked: BlockedUser[] = [
    { id: 'b1', name: 'Blocky McBlockface' },
    { id: 'b2', username: 'spammer' },
  ];

  it('lists blocked users and unblock calls the callback + drops the row', async () => {
    const onUnblock = vi.fn().mockResolvedValue(undefined);
    render(
      <BlockedUsersCatto
        fetchBlocked={vi.fn().mockResolvedValue(blocked)}
        onUnblock={onUnblock}
      />,
    );
    await screen.findByText('Blocky McBlockface');
    expect(screen.getAllByTestId('blocked-row')).toHaveLength(2);

    fireEvent.click(screen.getAllByRole('button', { name: /unblock/i })[0]);
    await waitFor(() => expect(onUnblock).toHaveBeenCalledWith('b1'));
    await waitFor(() =>
      expect(screen.getAllByTestId('blocked-row')).toHaveLength(1),
    );
  });

  it('self-hides when the blocked list is empty', async () => {
    const { container } = render(
      <BlockedUsersCatto
        fetchBlocked={vi.fn().mockResolvedValue([])}
        onUnblock={vi.fn()}
      />,
    );
    await waitFor(() => expect(container.querySelector('section')).toBeNull());
  });
});

describe('SMS_CONSENT_NOTICE', () => {
  it('is the OTP + STOP copy', () => {
    expect(SMS_CONSENT_NOTICE).toMatch(/one-time code/i);
    expect(SMS_CONSENT_NOTICE).toMatch(/STOP/);
  });
});
