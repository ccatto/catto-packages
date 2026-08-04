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

## Package-manager support (SPM + CocoaPods)

This package ships **both** a root `Package.swift` and a `.podspec`, so it works
under Capacitor's Swift Package Manager integration (Capacitor 8's default — a
`ios/App/CapApp-SPM/Package.swift`, **no** `Podfile`) *and* under CocoaPods.

If you fork this to build your own native plugin, two things are easy to miss and
cause `cap sync` to **silently drop the plugin** (it never shows in "Found N
Capacitor plugins", so `isPluginAvailable(...)` is `false` and callers fall back
to the web flow):

- **`exports` must expose `./package.json`.** `cap` finds plugins via
  `require.resolve('<pkg>/package.json')`; without
  `"./package.json": "./package.json"` in the `exports` map, modern Node throws
  `ERR_PACKAGE_PATH_NOT_EXPORTED` and discovery fails (worse in Yarn workspaces,
  where the package hoists to the root `node_modules`).
- **Ship a root `Package.swift`** whose library product name matches the name
  Capacitor derives from the npm name (`@ccatto/capacitor-inapp-auth` →
  `CcattoCapacitorInappAuth`). A `.podspec` alone only satisfies CocoaPods, not
  SPM.

Verify: `grep CcattoCapacitorInappAuth ios/App/CapApp-SPM/Package.swift` in the
consuming app after `npx cap sync ios`.

## Notes

- iOS only today. On web, `start()` throws `unavailable` — use the standard
  OAuth redirect flow there.
- The server flow that pairs with this plugin (a `mobile-social-start` route that
  initiates OAuth server-side and a `mobile-auth-callback` route that 302s to
  `myapp://…`) lives in the consuming app; see `@ccatto/react-auth`.
