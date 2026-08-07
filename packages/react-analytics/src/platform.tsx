// @ccatto/react-analytics/platform — AnalyticsPlatformCatto
//
// Zero-config drop-in that tags GA4 hits with the Capacitor platform. Shipped
// from its own `./platform` subpath so it can be a real client component ('use
// client') while the root `<GoogleAnalyticsCatto/>` stays server-safe.
//
// Render it right next to <GoogleAnalyticsCatto/> in your layout:
//   import { GoogleAnalyticsCatto } from '@ccatto/react-analytics';
//   import { AnalyticsPlatformCatto } from '@ccatto/react-analytics/platform';
//   <GoogleAnalyticsCatto />
//   <AnalyticsPlatformCatto />
'use client';

import { useAnalyticsPlatform } from './useAnalyticsPlatform';

export interface AnalyticsPlatformCattoProps {
  /** GA4 user-property name to set (default `'app_platform'`). */
  propertyName?: string;
  /** Override the detected platform (defaults to the Capacitor platform). */
  platform?: string;
}

/**
 * Sets the `app_platform` GA4 user property (ios / android / web) on mount.
 * Renders nothing. Register `app_platform` as a User-scoped custom dimension in
 * the GA admin to use it in reports.
 */
export function AnalyticsPlatformCatto({
  propertyName,
  platform,
}: AnalyticsPlatformCattoProps = {}): null {
  useAnalyticsPlatform({ propertyName, platform });
  return null;
}

export default AnalyticsPlatformCatto;
