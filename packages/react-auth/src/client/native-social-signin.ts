/**
 * @ccatto/react-auth - Native social sign-in handoff
 *
 * Drives the in-app-browser OAuth flow on native (Capacitor/iOS) and returns the
 * one-time handoff code. Pair the returned code with
 * `JwtAuthService.loginWithExchangeCode(code)` to mint app JWTs.
 *
 * Why this exists (see @ccatto/capacitor-inapp-auth): OAuth can't run in an
 * embedded webview, and SFSafariViewController can't return to the app via a
 * custom scheme. ASWebAuthenticationSession (this plugin) can. The server flow:
 *
 *   start → `${baseURL}${startPath}?provider=…`  (initiates OAuth server-side)
 *   provider auth → web callback → 302 `${callbackScheme}://auth-callback?code=…`
 *   ASWebAuthenticationSession captures the redirect → we parse `code` here.
 *
 * This module hardcodes nothing app-specific — `baseURL` and `callbackScheme`
 * come from config. `@capacitor/core` and `@ccatto/capacitor-inapp-auth` are
 * optional peer deps, imported dynamically so web-only consumers never load them.
 */

export interface NativeSocialSignInConfig {
  /** Provider key understood by the server route (e.g. 'google', 'apple', 'facebook'). */
  provider: string;
  /** Base URL of the web app that hosts the OAuth start route (no trailing slash needed). */
  baseURL: string;
  /** Custom URL scheme registered in Info.plist, WITHOUT '://' (e.g. 'myapp'). */
  callbackScheme: string;
  /** Server route that initiates OAuth in-session. Default: '/api/mobile-social-start'. */
  startPath?: string;
}

export type NativeSocialSignInReason =
  /** Not running in a native Capacitor context — caller should use the web OAuth redirect. */
  | 'not_native'
  /** Native, but the InAppAuth plugin isn't installed (old build) — caller should fall back. */
  | 'plugin_unavailable'
  /** User dismissed the auth sheet. */
  | 'canceled'
  /** The provider/callback returned an error, or no code came back. */
  | 'failed';

export type NativeSocialSignInResult =
  | { code: string }
  | { code?: undefined; error: NativeSocialSignInReason };

/**
 * Run the native in-app-browser OAuth handoff. Resolves to `{ code }` on success,
 * or `{ error }` describing why it didn't complete (so the caller can fall back
 * to the standard web OAuth redirect when appropriate).
 *
 * Never throws — all failure modes are returned as `{ error }`.
 *
 * @example
 * ```ts
 * const res = await startNativeSocialSignIn({
 *   provider: 'google',
 *   baseURL: process.env.NEXT_PUBLIC_BASE_URL!,
 *   callbackScheme: 'myapp',
 * });
 * if ('code' in res && res.code) {
 *   await authService.loginWithExchangeCode(res.code);
 * } else if (res.error === 'not_native' || res.error === 'plugin_unavailable') {
 *   await signInSocialOnWeb(provider); // standard redirect
 * }
 * ```
 */
export async function startNativeSocialSignIn(
  config: NativeSocialSignInConfig,
): Promise<NativeSocialSignInResult> {
  let Capacitor: typeof import('@capacitor/core').Capacitor;
  try {
    ({ Capacitor } = await import('@capacitor/core'));
  } catch {
    return { error: 'not_native' };
  }

  if (!Capacitor.isNativePlatform()) {
    return { error: 'not_native' };
  }
  if (!Capacitor.isPluginAvailable('InAppAuth')) {
    return { error: 'plugin_unavailable' };
  }

  const base = config.baseURL.replace(/\/$/, '');
  const startPath = config.startPath ?? '/api/mobile-social-start';
  const startUrl = `${base}${startPath}?provider=${encodeURIComponent(
    config.provider,
  )}`;

  try {
    const { InAppAuth } = await import('@ccatto/capacitor-inapp-auth');
    const { url } = await InAppAuth.start({
      url: startUrl,
      callbackScheme: config.callbackScheme,
    });

    const params = new URLSearchParams(url.split('?')[1] ?? '');
    const code = params.get('code');
    if (params.get('error') || !code) {
      return { error: 'failed' };
    }
    return { code };
  } catch (err) {
    // The plugin rejects with code "CANCELED" when the user dismisses the sheet.
    const message =
      err && typeof err === 'object' && 'code' in err
        ? String((err as { code?: unknown }).code)
        : '';
    if (message === 'CANCELED') {
      return { error: 'canceled' };
    }
    return { error: 'failed' };
  }
}
