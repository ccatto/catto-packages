import { WebPlugin } from '@capacitor/core';
import type {
  InAppAuthPlugin,
  InAppAuthStartOptions,
  InAppAuthStartResult,
} from './definitions';

/**
 * Web fallback. OAuth on the web should use the standard provider redirect flow
 * (Better Auth `signIn.social`), so the in-app-browser handoff is native-only.
 */
export class InAppAuthWeb extends WebPlugin implements InAppAuthPlugin {
  async start(_options: InAppAuthStartOptions): Promise<InAppAuthStartResult> {
    throw this.unavailable(
      'InAppAuth is only available on native platforms. On web, use the standard OAuth redirect flow.',
    );
  }
}
