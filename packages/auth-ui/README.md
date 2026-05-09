# @ccatto/auth-ui

Presentational React forms for authentication flows: sign-in, register, and a `LoginCatto` card wrapper. Designed to slot into the Catto app template (`@ccatto/ui` + `next-intl` + your auth client of choice).

The components are **bring-your-own-auth** — they don't import Better Auth, JWT, or any other backend. You pass an `onSubmit` callback that does the auth call (and any navigation that should follow); the form handles the loading state and error display.

## Install

```bash
yarn add @ccatto/auth-ui
```

Peer deps: `react`, `next-intl`, `@ccatto/ui`.

## Usage

```tsx
// app/[locale]/(public)/signin/page.tsx
'use client';

import { LoginCatto } from '@ccatto/auth-ui';
import { signIn } from '@/lib/auth-client-better';
import { useRouter } from '@/navigation';

export default function Page() {
  const router = useRouter();

  return (
    <LoginCatto
      onSubmit={async ({ email, password }) => {
        const result = await signIn.email({ email, password });
        if (result?.error) throw new Error(result.error.message);
        router.push('/dashboard'); // or '/paddles', or wherever
      }}
    />
  );
}
```

```tsx
// app/[locale]/(public)/signin/register/page.tsx
'use client';

import { RegisterUserFormCatto } from '@ccatto/auth-ui';
import { signUp } from '@/lib/auth-client-better';
import { useRouter } from '@/navigation';

export default function Page() {
  const router = useRouter();

  return (
    <RegisterUserFormCatto
      onSubmit={async ({ name, email, password }) => {
        const result = await signUp.email({ name, email, password });
        if (result?.error) throw new Error(result.error.message);
        router.push('/dashboard');
      }}
    />
  );
}
```

## Translation keys

Default namespace is `auth`; override with the `i18nNamespace` prop. Within the namespace the components expect:

```json
{
  "signIn": {
    "cardTitle": "Sign in to your account",
    "emailLabel": "Email",
    "passwordLabel": "Password",
    "submit": "Sign in",
    "submitting": "Signing in…",
    "errorGeneric": "Sign in failed. Check your credentials and try again."
  },
  "register": {
    "nameLabel": "Name",
    "emailLabel": "Email",
    "passwordLabel": "Password",
    "submit": "Create account",
    "submitting": "Creating account…",
    "errorGeneric": "Could not create your account. Try again or contact support."
  }
}
```

## Exports

- `LoginCatto` — `CardCatto` wrapper around `SignInEmailPassFormCatto`. Same props plus `cardVariant` / `cardWidth`.
- `SignInEmailPassFormCatto` — email + password form.
- `RegisterUserFormCatto` — name + email + password form.

All forms accept `i18nNamespace?: string` (default `'auth'`) and a required `onSubmit` callback.
