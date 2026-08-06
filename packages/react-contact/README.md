# @ccatto/react-contact

Plug-n-play **contact form that texts you**. Drop in a styled `ContactFormCatto`
component, wire one route handler with the framework-agnostic
`sendContactMessage()` helper, add a few env vars — done. Also ships the headless
`useContactForm` hook + Zod schema factory if you want to build your own UI.

- **Frontend:** `ContactFormCatto` — a styled "Contact us" form (name / email /
  phone / message), dark-mode friendly, with honeypot spam protection and
  optional reCAPTCHA v3. Transport-agnostic (POSTs JSON, or use `onSubmit`).
- **Backend:** `sendContactMessage()` (from `@ccatto/react-contact/server`) —
  zero framework deps, sends the submission to your phone via **Telnyx SMS**,
  with honeypot + optional captcha (Cloudflare Turnstile or reCAPTCHA)
  verification. Works in Next.js route handlers, server actions, NestJS, Express.

## Install

```bash
yarn add @ccatto/react-contact
```

---

## 🔌 Plug-n-play setup (future self / next Claude, read this)

Three steps: **(1)** render the form, **(2)** add one route handler, **(3)** set
env vars. That's it — a text hits your phone on every submission.

### 1. Render the form

```tsx
// app/[locale]/contact/page.tsx  (or anywhere)
import { ContactFormCatto } from '@ccatto/react-contact';

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-xl p-6">
      <ContactFormCatto /> {/* POSTs to /api/contact by default */}
    </div>
  );
}
```

The component owns its own styling (Tailwind, adapts to dark mode). Every string
is overridable — see [Component props](#contactformcatto-props).

### 2. Add the route handler (Next.js App Router)

```ts
// app/api/contact/route.ts
import { sendContactMessage } from '@ccatto/react-contact/server';

export async function POST(req: Request) {
  const result = await sendContactMessage(await req.json());
  return Response.json(
    { ok: result.ok, error: result.error },
    { status: result.ok ? 200 : 400 },
  );
}
```

`sendContactMessage()` reads its Telnyx + captcha config from env by default, so
the handler is a one-liner. Pass a config object to override (see below).

> **Why a separate `/server` import?** That module holds your Telnyx secret and
> is a plain server module (no `"use client"`). Importing it only from server
> code (route handlers / server actions) guarantees the secret never reaches the
> browser bundle.

### 3. Set env vars

```bash
# --- Required: Telnyx SMS ---
TELNYX_API_KEY=KEY0198...              # Telnyx API key
TELNYX_PHONE_NUMBER=+15551234567       # your Telnyx "from" number (E.164)
TELNYX_MESSAGING_PROFILE_ID=400...     # Telnyx messaging profile id
CONTACT_SMS_TO=+15559876543            # YOUR phone — where the text lands (E.164)

# --- Optional: captcha (auto-detected) ---
TURNSTILE_SECRET_KEY=0x4AAA...         # Cloudflare Turnstile secret  (or…)
RECAPTCHA_SECRET_KEY=6Lc...            # Google reCAPTCHA v3 secret
```

Captcha is **optional** and auto-detected: if `TURNSTILE_SECRET_KEY` is set the
token is verified against Turnstile; else if `RECAPTCHA_SECRET_KEY` is set it's
verified against reCAPTCHA; if neither, verification is skipped. With no Telnyx
config the helper returns `{ ok: false, error: 'Contact SMS is not configured…' }`
(it never throws), so local dev without keys degrades gracefully.

---

## Overriding config explicitly

```ts
import { sendContactMessage } from '@ccatto/react-contact/server';

const result = await sendContactMessage(payload, {
  telnyx: {
    apiKey: process.env.TELNYX_API_KEY,
    phoneNumber: process.env.TELNYX_PHONE_NUMBER,
    messagingProfileId: process.env.TELNYX_MESSAGING_PROFILE_ID,
    to: process.env.CONTACT_SMS_TO,
  },
  captcha: { provider: 'turnstile', secret: process.env.TURNSTILE_SECRET_KEY! },
  label: 'New PPR contact',           // SMS body prefix (default "New contact")
  onLog: (level, msg, meta) => logger[level](msg, meta),
});
```

`sendContactMessage()` returns
`{ ok, skipped?, messageId?, error? }` — `skipped: 'honeypot'` means a bot was
silently dropped (still `ok: true`).

## Using a GraphQL / custom backend instead of a REST route

Pass `onSubmit` to skip the built-in POST and call your own mutation. The
component still validates, manages state, runs reCAPTCHA, and reads the honeypot:

```tsx
<ContactFormCatto
  recaptchaSiteKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
  onSubmit={async ({ name, email, phone, message, website, token }) => {
    await submitContactMutation({
      variables: { input: { name, email, phone, message, website, token } },
    });
  }}
/>
```

You can still use `sendContactMessage()` inside your GraphQL resolver — it's just
a function.

---

## `ContactFormCatto` props

All optional. Copy props default to the strings shown in the reference design.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `action` | `string` | `'/api/contact'` | Endpoint the JSON body is POSTed to |
| `onSubmit` | `(data) => Promise<void>` | — | Custom submit; overrides `action` |
| `recaptchaSiteKey` | `string` | — | Enables reCAPTCHA v3 when set |
| `title` / `description` / `note` | `string` | reference copy | Header text; blue "real inbox" banner |
| `hideNote` | `boolean` | `false` | Remove the note banner |
| `nameLabel` / `emailLabel` / `phoneLabel` / `messageLabel` | `string` | reference copy | Field labels |
| `submitLabel` / `sendingLabel` / `successMessage` | `string` | reference copy | Button + success text |
| `*Placeholder` | `string` | reference copy | Field placeholders |
| `requireMessage` | `boolean` | `true` | Require the message field |
| `className` | `string` | — | Extra classes on the `<form>` |

The wire shape sent to `action` / `onSubmit`:

```ts
interface ContactMessageInput {
  name: string; email: string; phone?: string; message: string;
  website?: string; // honeypot
  token?: string;   // captcha token (reCAPTCHA / Turnstile)
}
```

---

## Headless usage (`useContactForm`)

Prefer to build your own markup? The hook is unchanged:

```tsx
import { useContactForm } from '@ccatto/react-contact';

function ContactPage() {
  const { register, handleSubmit, errors, isSubmitting, isSuccess } =
    useContactForm({
      schema: { fields: { subject: { enabled: false } } },
      onSubmit: async (data) => {
        await fetch('/api/contact', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      },
    });

  return (
    <form onSubmit={handleSubmit}>
      <input {...register('senderName')} placeholder="Name" />
      <input {...register('senderEmail')} placeholder="Email" />
      <textarea {...register('message')} placeholder="Message" />
      <button type="submit" disabled={isSubmitting}>Send</button>
      {isSuccess && <p>Message sent!</p>}
    </form>
  );
}
```

## Peer Dependencies

| Package | Version | Required |
| --- | --- | --- |
| `@hookform/resolvers` | `>=3.0.0` | Yes |
| `react` | `>=18.0.0` | Yes |
| `react-hook-form` | `>=7.0.0` | Yes |
| `zod` | `>=3.0.0` | Yes |
| `@ccatto/profanity` | `*` | No |

The `./server` helper has **no runtime dependencies** — it only uses `fetch`.

## License

MIT
