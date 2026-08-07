// @ccatto/react-analytics
//
// Drop-in Google Analytics 4 for the Next.js App Router. Server-safe barrel —
// mirrors @next/third-parties' own google/index.js, which re-exports from a
// 'use client' module without itself being a client module.

export { GoogleAnalyticsCatto } from './GoogleAnalyticsCatto';
export type { GoogleAnalyticsCattoProps } from './GoogleAnalyticsCatto';
export { trackEvent } from './trackEvent';

// Custom dimensions / Capacitor platform (Next.js + Capacitor architecture).
// The ready-made client component lives at `@ccatto/react-analytics/platform`.
export { setUserProperties } from './setUserProperties';
export { getCapacitorPlatform } from './getCapacitorPlatform';
export type { CapacitorPlatform } from './getCapacitorPlatform';
export { useAnalyticsPlatform } from './useAnalyticsPlatform';
export type { UseAnalyticsPlatformOptions } from './useAnalyticsPlatform';
