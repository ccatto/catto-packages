# @ccatto/sms

Runtime-agnostic SMS sender (Telnyx) for Node/Edge apps — Next.js route handlers,
Better Auth `sendOtp`, serverless functions. No NestJS dependency. For a NestJS
app, use [`@ccatto/nest-sms`](../nest-sms) instead.

## Secrets

This package **never reads `process.env`**. You pass `apiKey` (and the sending
identity) as arguments, so credentials live in your app's environment and never
in this public package.

## Usage

```ts
import { sendSms } from '@ccatto/sms';

await sendSms({
  apiKey: process.env.TELNYX_API_KEY!,
  from: process.env.TELNYX_PHONE_NUMBER,            // E.164, e.g. +18335291569
  messagingProfileId: process.env.TELNYX_MESSAGING_PROFILE_ID,
  to: '+15551234567',
  text: 'Your verification code is 123456.',
});
```

### With Better Auth phone OTP (`@ccatto/react-auth`)

```ts
phoneAuth: {
  enabled: !!process.env.TELNYX_API_KEY,
  sendOtp: ({ phoneNumber, code }) =>
    sendSms({
      apiKey: process.env.TELNYX_API_KEY!,
      from: process.env.TELNYX_PHONE_NUMBER,
      messagingProfileId: process.env.TELNYX_MESSAGING_PROFILE_ID,
      to: phoneNumber,
      text: `Your verification code is ${code}.`,
    }).then(() => undefined),
}
```

## `from` vs `messagingProfileId`

Provide one or both. When both are set they're sent together, so Telnyx pins the
sender to `from` and routes via the profile. Passing **only** `messagingProfileId`
makes Telnyx auto-pick a number from the profile pool — which `422`s when that
selection fails (e.g. a lone toll-free number, or a number not on the profile).
Passing both is the safe default.
