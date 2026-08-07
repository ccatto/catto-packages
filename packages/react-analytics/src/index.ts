// @ccatto/react-analytics
//
// Drop-in Google Analytics 4 for the Next.js App Router. Server-safe barrel —
// mirrors @next/third-parties' own google/index.js, which re-exports from a
// 'use client' module without itself being a client module.

export { GoogleAnalyticsCatto } from './GoogleAnalyticsCatto';
export type { GoogleAnalyticsCattoProps } from './GoogleAnalyticsCatto';
export { trackEvent } from './trackEvent';
