// @ccatto/react-analytics — trackEvent
//
// Typed custom-event helper. 'use client' marks intent; the real client boundary
// is provided by @next/third-parties (sendGAEvent comes from its 'use client'
// google/ga.js module). Safe to import anywhere — it no-ops when there's no
// window or when GA isn't loaded, so call sites never need guards.
'use client';

import { sendGAEvent } from '@next/third-parties/google';

/**
 * Send a GA4 custom event.
 *
 * @param name   Event name, e.g. `"contact_submit"`.
 * @param params Optional event params, e.g. `{ plan: "pro" }`.
 *
 * @example
 * import { trackEvent } from '@ccatto/react-analytics';
 * trackEvent('contact_submit', { plan: 'pro' });
 */
export function trackEvent(
  name: string,
  params?: Record<string, unknown>,
): void {
  if (typeof window === 'undefined') return;
  try {
    sendGAEvent('event', name, params ?? {});
  } catch {
    /* GA not configured / not loaded — no-op */
  }
}

export default trackEvent;
