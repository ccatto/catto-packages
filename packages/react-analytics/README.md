# @ccatto/react-analytics

Drop-in **Google Analytics 4** for the Next.js App Router — with first-class
**Capacitor** support. One import, one env var, done. Thin, typed wrapper over
[`@next/third-parties`](https://nextjs.org/docs/app/building-your-application/optimizing/third-party-libraries).

- **`<GoogleAnalyticsCatto />`** — server-safe component; renders GA only when a
  measurement id is present (so dev/preview with no id sends nothing).
- **`trackEvent(name, params?)`** — typed custom-event helper that no-ops safely
  when GA isn't loaded, so call sites never need guards.
- **`<AnalyticsPlatformCatto />`** (from `@ccatto/react-analytics/platform`) —
  tags every hit with the Capacitor platform (`ios` / `android` / `web`) so one
  GA4 property serves web **and** your native app.

## Install

```bash
yarn add @ccatto/react-analytics @next/third-parties
```

Peer deps: `next` (>=14, tested on 16), `react` (>=18), `@next/third-parties`
(match your Next major).

## Setup (3 steps)

### 1. Render the component in your root layout

```tsx
// app/[locale]/layout.tsx  (or app/layout.tsx)
import { GoogleAnalyticsCatto } from '@ccatto/react-analytics';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <GoogleAnalyticsCatto />
      </body>
    </html>
  );
}
```

`<GoogleAnalyticsCatto />` reads `NEXT_PUBLIC_GA_MEASUREMENT_ID` by default; pass
`gaId` to override (e.g. a per-tenant id). No `'use client'` needed — it stays a
server component and renders the client GA script internally.

### 2. Set the env var

```bash
# .env / Dockerfile ARG — public id, safe to bake into the build
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Leave it blank locally to send zero dev traffic to GA — the component renders
`null` when there's no id.

### 3. Track custom events (anywhere in a client component)

```tsx
'use client';
import { trackEvent } from '@ccatto/react-analytics';

<button onClick={() => trackEvent('contact_submit', { plan: 'pro' })}>
  Send
</button>;
```

`trackEvent` no-ops on the server and when GA hasn't loaded, so it's always safe
to call.

## Capacitor: differentiate iOS / Android / web

A Capacitor app is your Next.js web app running in a native WebView — so the
**same GA4 Web data stream captures both** browser and in-app traffic. You do
**not** need separate iOS/Android app streams (those are a different, Firebase
SDK route). To tell "installed app" from "mobile browser", tag every hit with a
platform user property. Drop in `<AnalyticsPlatformCatto />` next to the GA tag:

```tsx
// app/[locale]/layout.tsx
import { GoogleAnalyticsCatto } from '@ccatto/react-analytics';
import { AnalyticsPlatformCatto } from '@ccatto/react-analytics/platform';

<GoogleAnalyticsCatto />
<AnalyticsPlatformCatto />   {/* sets app_platform = ios | android | web */}
```

It reads Capacitor's injected `window.Capacitor` global — **no `@capacitor/core`
dependency**, so web-only apps just report `web`. Then register `app_platform` as
a **User-scoped custom dimension** in the GA admin (Admin → Custom definitions).

Prefer to wire it yourself? The same behavior is available as a hook and helpers:

```tsx
'use client';
import { useAnalyticsPlatform } from '@ccatto/react-analytics';
function AnalyticsBoot() { useAnalyticsPlatform(); return null; }

// or fully manual:
import { setUserProperties, getCapacitorPlatform } from '@ccatto/react-analytics';
setUserProperties({ app_platform: getCapacitorPlatform() });
```

Only add native Android/iOS app streams (the Firebase SDK) if you specifically
need native metrics — app install/open events, Play/App Store attribution.

## API

### `@ccatto/react-analytics`

| Export | Signature | Notes |
| --- | --- | --- |
| `GoogleAnalyticsCatto` | `({ gaId?: string }) => JSX \| null` | Server-safe; falls back to `NEXT_PUBLIC_GA_MEASUREMENT_ID`; `null` when no id |
| `trackEvent` | `(name: string, params?: Record<string, unknown>) => void` | Wraps `sendGAEvent('event', name, params)`; safe no-op when unavailable |
| `setUserProperties` | `(props: Record<string, string \| number \| boolean \| null \| undefined>) => void` | Wraps `gtag('set', 'user_properties', …)`; attaches to all subsequent hits |
| `getCapacitorPlatform` | `() => 'ios' \| 'android' \| 'web'` | Reads `window.Capacitor` (no `@capacitor/core` import) |
| `useAnalyticsPlatform` | `(opts?: { propertyName?, platform? }) => void` | Hook: sets the platform user property once on mount |

### `@ccatto/react-analytics/platform`

| Export | Signature | Notes |
| --- | --- | --- |
| `AnalyticsPlatformCatto` | `({ propertyName?, platform? }) => null` | `'use client'` drop-in; sets `app_platform` on mount |

## Peer Dependencies

| Package | Version | Required |
| --- | --- | --- |
| `next` | `>=14.0.0` | Yes |
| `react` | `>=18.0.0` | Yes |
| `@next/third-parties` | `>=14.0.0` | Yes (match your Next major) |

## License

MIT
