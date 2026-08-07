# Changelog

All notable changes to `@ccatto/react-analytics` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-08-07

### Added

- Initial release. Drop-in Google Analytics 4 for the Next.js App Router, built
  on `@next/third-parties`.
- **`<GoogleAnalyticsCatto />`** — server-safe component that renders GA only
  when a measurement id is present (`gaId` prop, else
  `NEXT_PUBLIC_GA_MEASUREMENT_ID`; `null` otherwise).
- **`trackEvent(name, params?)`** — typed custom-event helper wrapping
  `sendGAEvent`; safe no-op on the server and when GA isn't loaded.
