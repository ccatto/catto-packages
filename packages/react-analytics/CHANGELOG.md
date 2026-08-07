# Changelog

All notable changes to `@ccatto/react-analytics` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-08-07

### Added

Capacitor platform support — so one GA4 Web data stream serves both the web app
and the native (Capacitor WebView) app, differentiated by an `app_platform`
custom dimension. No `@capacitor/core` dependency (reads the injected
`window.Capacitor` global; web-only apps report `web`).

- **`<AnalyticsPlatformCatto />`** (new `@ccatto/react-analytics/platform`
  subpath) — `'use client'` drop-in that sets the `app_platform` GA4 user
  property (`ios` / `android` / `web`) on mount. Render next to
  `<GoogleAnalyticsCatto />`.
- **`getCapacitorPlatform()`** — returns `'ios' | 'android' | 'web'`.
- **`setUserProperties(props)`** — wraps `gtag('set', 'user_properties', …)`;
  safe no-op when GA isn't loaded.
- **`useAnalyticsPlatform(opts?)`** — hook form of the platform tagger, for apps
  that prefer to wire it into an existing client component.

`<GoogleAnalyticsCatto />` is unchanged and remains server-safe.

## [1.0.0] - 2026-08-07

### Added

- Initial release. Drop-in Google Analytics 4 for the Next.js App Router, built
  on `@next/third-parties`.
- **`<GoogleAnalyticsCatto />`** — server-safe component that renders GA only
  when a measurement id is present (`gaId` prop, else
  `NEXT_PUBLIC_GA_MEASUREMENT_ID`; `null` otherwise).
- **`trackEvent(name, params?)`** — typed custom-event helper wrapping
  `sendGAEvent`; safe no-op on the server and when GA isn't loaded.
