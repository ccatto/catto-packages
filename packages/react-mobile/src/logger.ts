/**
 * Configurable logger for @ccatto/react-mobile
 *
 * Uses the shared CattoLogger interface from @ccatto/logger.
 *
 * Usage in your app's providers:
 *   import { configureMobileLogger } from '@ccatto/react-mobile';
 *   import { log } from '@/app/lib/logger';
 *   configureMobileLogger(log);
 */

import type { CattoLogger } from '@ccatto/logger';
import { noopLogger } from '@ccatto/logger';

// Re-export CattoLogger as CattoMobileLogger for backward compatibility
export type CattoMobileLogger = CattoLogger;

let currentLogger: CattoLogger = noopLogger;

/**
 * Configure the logger used by all @ccatto/react-mobile hooks.
 * Call once at app startup (e.g., in your providers).
 */
export function configureMobileLogger(logger: CattoLogger): void {
  currentLogger = logger;
}

/**
 * Get the current logger instance (internal use by hooks).
 */
export function getLogger(): CattoLogger {
  return currentLogger;
}
