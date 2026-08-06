# Changelog

All notable changes to `@ccatto/react-contact` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-08-05

### Added

- **`ContactFormCatto`** — a plug-n-play, styled "Contact us" form component
  (name / email / phone / message) that wraps `useContactForm`. Dark-mode
  friendly, honeypot spam protection, optional reCAPTCHA v3, fully
  copy-overridable. Transport-agnostic: POSTs a friendly JSON body to a
  configurable endpoint (default `/api/contact`) or calls a custom `onSubmit`
  (e.g. a GraphQL mutation).
- **`sendContactMessage()`** server helper, exported from the new
  **`@ccatto/react-contact/server`** subpath. Framework-agnostic (zero runtime
  deps — just `fetch`); sends the submission to the site owner via **Telnyx
  SMS**, with honeypot filtering and optional captcha verification (Cloudflare
  Turnstile or Google reCAPTCHA v3). Reads Telnyx/captcha config from standard
  env vars by default, or accepts an explicit config object. Works in Next.js
  route handlers, server actions, NestJS, and Express.
- **`ContactMessageInput`** type — the friendly wire shape shared by the
  component and the server helper.

### Build

- `tsup` now emits two entries: `index` (client, `"use client"`) and `server`
  (plain server module, **no** `"use client"` — it holds secrets). `splitting`
  disabled so no shared chunk can leak the directive onto server code.

### Env vars (for consumers)

`TELNYX_API_KEY`, `TELNYX_PHONE_NUMBER`, `TELNYX_MESSAGING_PROFILE_ID`,
`CONTACT_SMS_TO`, and optionally `TURNSTILE_SECRET_KEY` / `RECAPTCHA_SECRET_KEY`.
See the README for the full plug-n-play setup.

## [1.0.0]

### Added

- `useContactForm` hook (React Hook Form + Zod + optional reCAPTCHA v3).
- `useRecaptcha` hook.
- `createContactSchema` Zod schema factory with per-field config and optional
  profanity checking.
