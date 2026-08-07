// @ccatto/react-analytics — setUserProperties
//
// Set GA4 user properties (custom dimensions), attached to all subsequent hits
// including auto pageviews. Thin wrapper over `gtag('set', 'user_properties', …)`
// via @next/third-parties' `sendGAEvent` (which queues into the dataLayer, so it
// is safe to call before gtag finishes loading). No-ops on the server / when GA
// isn't configured, so call sites need no guards.

import { sendGAEvent } from '@next/third-parties/google';

/**
 * Set GA4 user properties. Register each key as a User-scoped custom dimension
 * in the GA admin to use it in reports.
 *
 * @example
 * setUserProperties({ app_platform: 'ios', tier: 'pro' });
 */
export function setUserProperties(
  properties: Record<string, string | number | boolean | null | undefined>,
): void {
  if (typeof window === 'undefined') return;
  try {
    sendGAEvent('set', 'user_properties', properties);
  } catch {
    /* GA not configured / not loaded — no-op */
  }
}

export default setUserProperties;
