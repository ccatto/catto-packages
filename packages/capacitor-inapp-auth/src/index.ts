import { registerPlugin } from '@capacitor/core';
import type { InAppAuthPlugin } from './definitions';

/**
 * InAppAuth — presents Apple's ASWebAuthenticationSession for an OAuth flow and
 * hands the custom-scheme callback URL back to JS.
 *
 * Why this exists: SFSafariViewController (what `@capacitor/browser` opens)
 * silently blocks redirect navigation to custom URL schemes, so the web OAuth
 * flow can never return to the app. ASWebAuthenticationSession is Apple's
 * purpose-built API for exactly this.
 */
export const InAppAuth = registerPlugin<InAppAuthPlugin>('InAppAuth', {
  web: () => import('./web').then((m) => new m.InAppAuthWeb()),
});

export * from './definitions';
