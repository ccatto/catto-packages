/**
 * Configurable logger for @ccatto/react-push
 *
 * Uses the shared CattoLogger interface from @ccatto/logger.
 *
 * Usage in your app's providers:
 *   import { configurePushLogger } from '@ccatto/react-push';
 *   import { log } from '@/app/lib/logger';
 *   configurePushLogger(log);
 */

import type { CattoLogger } from '@ccatto/logger';
import { noopLogger } from '@ccatto/logger';

// Re-export CattoLogger as CattoPushLogger for package-specific naming
export type CattoPushLogger = CattoLogger;

let currentLogger: CattoLogger = noopLogger;

/**
 * Configure the logger used by all @ccatto/react-push hooks.
 * Call once at app startup (e.g., in your providers).
 */
export function configurePushLogger(logger: CattoLogger): void {
  currentLogger = logger;
}

/**
 * Get the current logger instance (internal use by hooks).
 */
export function getLogger(): CattoLogger {
  return currentLogger;
}
