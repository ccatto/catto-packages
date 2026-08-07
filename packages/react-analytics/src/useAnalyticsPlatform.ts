// @ccatto/react-analytics — useAnalyticsPlatform
//
// Sets a GA4 user property (default `app_platform`) to the current Capacitor
// platform once on mount, so every hit is attributable to ios / android / web.
// This is a plain hook — call it from any client component (or use the ready-made
// <AnalyticsPlatformCatto/> from `@ccatto/react-analytics/platform`).

import { useEffect } from 'react';
import { getCapacitorPlatform } from './getCapacitorPlatform';
import { setUserProperties } from './setUserProperties';

export interface UseAnalyticsPlatformOptions {
  /** GA4 user-property name (default `'app_platform'`). */
  propertyName?: string;
  /** Override the detected platform (defaults to `getCapacitorPlatform()`). */
  platform?: string;
}

/**
 * @example
 * 'use client';
 * function AnalyticsBoot() { useAnalyticsPlatform(); return null; }
 */
export function useAnalyticsPlatform(
  options?: UseAnalyticsPlatformOptions,
): void {
  const propertyName = options?.propertyName ?? 'app_platform';
  const platform = options?.platform;
  useEffect(() => {
    setUserProperties({ [propertyName]: platform ?? getCapacitorPlatform() });
  }, [propertyName, platform]);
}

export default useAnalyticsPlatform;
