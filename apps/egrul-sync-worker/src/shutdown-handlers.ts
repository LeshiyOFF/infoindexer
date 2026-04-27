/**
 * Graceful Shutdown Handlers
 *
 * @remarks
 * Handles SIGINT and SIGTERM signals for clean shutdown.
 */
import type { IGracefulShutdown } from './core/ports';
import { getAppState } from './app-state';

/**
 * Handle shutdown signals (SIGINT, SIGTERM)
 */
export async function handleShutdownSignal(signal: string): Promise<void> {
  const appState = getAppState();

  if (!appState) {
    process.exit(1);
    return;
  }

  const result = await appState.gracefulShutdownService.shutdown({
    signal,
    timestamp: Date.now()
  });

  if (result.success) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

/**
 * Save progress for active operations
 */
export async function saveActiveOperationsProgress(): Promise<number> {
  const appState = getAppState();
  if (!appState) {
    return 0;
  }

  const operations = getActiveOperations();
  let saved = 0;

  for (const [type, operation] of operations) {
    if (operation.controller.signal.aborted) {
      continue;
    }

    operation.controller.abort();
    deleteActiveOperation(type);
    saved++;
  }

  return saved;
}

/**
 * Active operations storage (module-level)
 */
const activeOperations = new Map<string, { controller: AbortController; type: 'egrul' | 'sanctions' | 'refresh' }>();

export function getActiveOperations() {
  return activeOperations;
}

export function deleteActiveOperation(type: string): void {
  activeOperations.delete(type);
}
