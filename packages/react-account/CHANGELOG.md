# Changelog

All notable changes to `@ccatto/react-account` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-08-08

### Added

- Initial release. Reusable, dual-auth-aware account-settings UI —
  transport-agnostic (inject callbacks) with a `labels` prop.
- **`<AccountSettingsCatto>`** — composed panel: identity slot + phone + blocked
  users + delete.
- **`<PhoneManagerCatto>`** — view/remove phone with the **phone-first safeguard**
  (blocks removal when phone is the sole login method) + the STOP/consent notice;
  optional `smsPreferences` slot hidden by default (OTP-only stance).
- **`<DeleteAccountCatto>`** — irreversible, type-to-confirm.
- **`<BlockedUsersCatto>`** — self-loads via injected `fetchBlocked`, unblock via
  `onUnblock` (optimistic); self-hides when empty.
- **`canRemovePhone` / `hasOtherLoginMethod`** rule (use client + server) and the
  **`SMS_CONSENT_NOTICE`** copy constant.
