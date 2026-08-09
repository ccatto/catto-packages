# @ccatto/react-account

Reusable, **dual-auth-aware** account-settings UI — identity, **phone/SMS
removal**, delete account, and blocked users. **Transport-agnostic** (inject async
callbacks; no data client, no secrets) with a `labels` prop — mirrors
`@ccatto/react-comments`. Identity is a **slot**, so you plug in
`@ccatto/auth-ui`'s `UserProfileFormCatto` (or your own).

- **`<AccountSettingsCatto>`** — composed panel (identity slot + phone + blocked + delete).
- **`<PhoneManagerCatto>`** — view/remove your number, with the **phone-first safeguard**.
- **`<DeleteAccountCatto>`** — irreversible, type-to-confirm.
- **`<BlockedUsersCatto>`** — list + unblock.
- **`canRemovePhone(...)`** rule + **`SMS_CONSENT_NOTICE`** copy.

## Install

```bash
yarn add @ccatto/react-account
```

Peers: `react` (>=18) and `@ccatto/ui` (>=1.10.0).

## ⚠️ Phone / SMS — the compliance model (read this)

These components assume the app sends **OTP-only** SMS (transactional,
user-initiated) — **no marketing**:

- **No "unsubscribe from SMS" toggle.** There's nothing recurring to unsubscribe
  from; carrier-level **STOP** already opts a number out. `<PhoneManagerCatto>`
  exposes an optional `smsPreferences` slot that is **hidden unless you provide
  it** — only add one if your app later sends non-OTP SMS (which needs a real
  TCPA opt-in).
- **"Remove phone number"** is the real "stop getting OTP" control.
- **Phone-first safeguard (critical).** If phone is the user's **only** login
  method, removing it would lock them out. `<PhoneManagerCatto>` **blocks removal**
  when `canRemovePhone(currentUser)` is false. This is the client half of a
  defense-in-depth pair — **your server MUST enforce the same rule** and reject the
  removal (never strip the only credential):

  ```ts
  import { canRemovePhone } from '@ccatto/react-account';

  // in your removePhone resolver:
  const methods = { hasPassword: !!user.password, hasOAuth: accounts.length > 0, hasPasskey: passkeys.length > 0 };
  if (!canRemovePhone(methods)) {
    throw new BadRequestException('Add another sign-in method before removing your phone.');
  }
  await clearUserPhone(user.id);
  ```

- Consent copy for the phone-entry step (shown at login by your app, not here) is
  exported: **`SMS_CONSENT_NOTICE`** — *"We'll text a one-time code. Msg & data
  rates may apply. Reply STOP to opt out."*

> Why this matters: an approved Telnyx A2P number is hard-won. Staying strictly
> OTP + honoring STOP protects it; losing it would lock out **all** phone-OTP
> customers. *Not legal advice — confirm A2P/TCPA specifics with counsel before
> scaling SMS.*

## Usage

```tsx
'use client';
import { AccountSettingsCatto } from '@ccatto/react-account';
import { UserProfileFormCatto } from '@ccatto/auth-ui';

// `currentUser` is your unified dual-auth shape (Better Auth OR JWT). The method
// booleans come from your backend — the client can't reliably infer them.
const currentUser = {
  id: user.id,
  name: user.name,
  email: realEmail(user),
  phone: user.phoneNumber,
  image: user.image,
  hasPassword: user.hasPassword, // from your backend
  hasOAuth: user.hasOAuth,
  hasPasskey: user.hasPasskey,
};

<AccountSettingsCatto
  currentUser={currentUser}
  identitySlot={
    <UserProfileFormCatto
      initialValues={{ name: currentUser.name ?? '', email: currentUser.email ?? '' }}
      phoneNumber={currentUser.phone ?? undefined}
      onSubmit={saveProfile}
    />
  }
  onRemovePhone={() => runMutation(REMOVE_PHONE)}   // your mutation (enforces canRemovePhone server-side)
  fetchBlocked={() => runQuery(MY_BLOCKED_USERS)}   // -> { id, name?, username? }[]
  onUnblock={(id) => runMutation(UNBLOCK_USER, { userId: id })}
  onDeleteAccount={async () => { await runMutation(DELETE_ACCOUNT); await signOutEverywhere(); }}
/>;
```

Prefer a custom layout? Import and arrange the parts (`PhoneManagerCatto`,
`BlockedUsersCatto`, `DeleteAccountCatto`) yourself. Every string is overridable
via each component's `labels` prop (defaults exported as `DEFAULT_*_LABELS`).

## License

MIT
