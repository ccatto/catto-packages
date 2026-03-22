/**
 * Configurable logger for @ccatto/react-contact
 *
 * Uses the shared CattoLogger interface from @ccatto/logger.
 *
 * Usage in your app's providers:
 *   import { configureContactLogger } from '@ccatto/react-contact';
 *   import { log } from '@/app/lib/logger';
 *   configureContactLogger(log);
 */

import type { CattoLogger } from '@ccatto/logger';
import { noopLogger } from '@ccatto/logger';

// Re-export CattoLogger as CattoContactLogger for backward compatibility
export type CattoContactLogger = CattoLogger;

let currentLogger: CattoLogger = noopLogger;

/**
 * Configure the logger used by all @ccatto/react-contact hooks.
 * Call once at app startup (e.g., in your providers).
 */
export function configureContactLogger(logger: CattoLogger): void {
  currentLogger = logger;
}

/**
 * Get the current logger instance (internal use by hooks).
 */
export function getLogger(): CattoLogger {
  return currentLogger;
}
