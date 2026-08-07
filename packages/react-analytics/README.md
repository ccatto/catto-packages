# @ccatto/react-analytics

Drop-in **Google Analytics 4** for the Next.js App Router. One import, one env
var, done — every Catto app wires GA the same way. Thin, typed wrapper over
[`@next/third-parties`](https://nextjs.org/docs/app/building-your-application/optimizing/third-party-libraries).

- **`<GoogleAnalyticsCatto />`** — server-safe component; renders GA only when a
  measurement id is present (so dev/preview with no id sends nothing).
- **`trackEvent(name, params?)`** — typed custom-event helper that no-ops safely
  when GA isn't loaded, so call sites never need guards.

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

## API

| Export | Signature | Notes |
| --- | --- | --- |
| `GoogleAnalyticsCatto` | `({ gaId?: string }) => JSX \| null` | Server-safe; falls back to `NEXT_PUBLIC_GA_MEASUREMENT_ID`; `null` when no id |
| `trackEvent` | `(name: string, params?: Record<string, unknown>) => void` | Wraps `sendGAEvent('event', name, params)`; safe no-op when unavailable |

## Peer Dependencies

| Package | Version | Required |
| --- | --- | --- |
| `next` | `>=14.0.0` | Yes |
| `react` | `>=18.0.0` | Yes |
| `@next/third-parties` | `>=14.0.0` | Yes (match your Next major) |

## License

MIT
