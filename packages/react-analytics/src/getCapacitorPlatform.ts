// @ccatto/react-analytics — getCapacitorPlatform
//
// Reads Capacitor's injected `window.Capacitor` global to tell whether the app
// is running as a native iOS/Android WebView or in a plain browser. Reading the
// global (rather than importing `@capacitor/core`) keeps Capacitor an OPTIONAL,
// zero-dependency concern: web-only apps just get `'web'`.

export type CapacitorPlatform = 'ios' | 'android' | 'web';

interface CapacitorGlobal {
  getPlatform?: () => string;
  isNativePlatform?: () => boolean;
}

/**
 * The current platform: `'ios'` / `'android'` inside a native Capacitor WebView,
 * else `'web'` (browser, SSR, or no Capacitor). Never throws.
 */
export function getCapacitorPlatform(): CapacitorPlatform {
  if (typeof window === 'undefined') return 'web';
  const cap = (window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor;
  const platform = cap?.getPlatform?.();
  return platform === 'ios' || platform === 'android' ? platform : 'web';
}

export default getCapacitorPlatform;
