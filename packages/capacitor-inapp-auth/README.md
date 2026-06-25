# @ccatto/capacitor-inapp-auth

A tiny Capacitor plugin that wraps **`ASWebAuthenticationSession`** so an OAuth
flow (Google / Apple / Facebook) can run in the system browser from inside a
native app and return via a **custom URL scheme**.

## Why

- OAuth providers block embedded webviews (`disallowed_useragent`), so OAuth must
  use the system browser.
- `SFSafariViewController` (what `@capacitor/browser` opens) **silently blocks**
  redirect navigation to custom schemes (`myapp://…`) — the sheet just hangs.
- `ASWebAuthenticationSession` is Apple's purpose-built API: it captures the
  registered callback scheme, dismisses the sheet, and hands the URL back to JS.

## Install

```bash
npm install @ccatto/capacitor-inapp-auth
npx cap sync ios
```

## Usage

```ts
import { InAppAuth } from '@ccatto/capacitor-inapp-auth';
import { Capacitor } from '@capacitor/core';

if (Capacitor.isPluginAvailable('InAppAuth')) {
  const { url } = await InAppAuth.start({
    url: 'https://yourapp.com/api/mobile-social-start?provider=google',
    callbackScheme: 'myapp', // must match a CFBundleURLSchemes entry in Info.plist
  });
  // url === 'myapp://auth-callback?code=…'
  const code = new URLSearchParams(url.split('?')[1]).get('code');
}
```

`start()` rejects with code `"CANCELED"` if the user dismisses the sheet.

## iOS setup

1. Register your scheme in `Info.plist` under `CFBundleURLTypes` →
   `CFBundleURLSchemes` (e.g. `myapp`).
2. The plugin conforms to `CAPBridgedPlugin` (required for Capacitor 6+
   registration) and targets iOS 14+.

## Notes

- iOS only today. On web, `start()` throws `unavailable` — use the standard
  OAuth redirect flow there.
- The server flow that pairs with this plugin (a `mobile-social-start` route that
  initiates OAuth server-side and a `mobile-auth-callback` route that 302s to
  `myapp://…`) lives in the consuming app; see `@ccatto/react-auth`.
