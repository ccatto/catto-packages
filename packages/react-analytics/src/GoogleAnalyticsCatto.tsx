// @ccatto/react-analytics — GoogleAnalyticsCatto
//
// Drop-in GA4 wrapper for the Next.js App Router. Server-safe by design (no
// 'use client'): it only renders @next/third-parties' <GoogleAnalytics/>, which
// is itself the client component. Rendering a client child from a server
// component is the normal RSC pattern, so this can live directly in a server
// layout without forcing a client boundary.

import { GoogleAnalytics } from '@next/third-parties/google';

export interface GoogleAnalyticsCattoProps {
  /**
   * GA4 measurement id (e.g. `G-XXXXXXXXXX`). When omitted, falls back to
   * `process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID`. When neither is set, renders
   * nothing — so dev/preview builds with no id send zero traffic.
   */
  gaId?: string;
}

/**
 * GoogleAnalyticsCatto — render once, near the end of your root layout `<body>`.
 *
 * @example
 * // app/[locale]/layout.tsx
 * import { GoogleAnalyticsCatto } from '@ccatto/react-analytics';
 * // ...inside <body>, after the app tree:
 * <GoogleAnalyticsCatto />
 */
export function GoogleAnalyticsCatto({ gaId }: GoogleAnalyticsCattoProps) {
  const id = gaId ?? process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!id) return null;
  return <GoogleAnalytics gaId={id} />;
}

export default GoogleAnalyticsCatto;
