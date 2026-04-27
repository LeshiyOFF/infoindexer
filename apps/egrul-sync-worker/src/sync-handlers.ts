/**
 * Sync Operation Handlers
 *
 * @remarks
 * Handles EGRUL sync, sanctions sync, and cache refresh operations.
 */
import { getAppState } from './app-state';
import { registerOperation } from './redis-handlers';
import { getActiveOperations, deleteActiveOperation } from './shutdown-handlers';

/**
 * Handle EGRUL + Sanctions full sync
 */
export async function handleEgrulSync(message: string): Promise<void> {
  const appState = getAppState();
  if (!appState) return;

  console.log('Command recognized. Triggering full EGRUL + Sanctions sync...');

  if (appState.gracefulShutdownService.isShuttingDown()) {
    console.log('Shutdown in progress, ignoring new sync request');
    return;
  }

  const activeOperations = getActiveOperations();
  if (activeOperations.has('egrul')) {
    console.log('EGRUL sync already running');
    return;
  }

  const controller = registerOperation('egrul');
  const enableEnrichment = message === 'enrichment:true' || process.env.ENABLE_ENRICHMENT === 'true';

  try {
    await appState.egrulSyncService.run({ enableEnrichment, abortSignal: controller.signal });
  } catch (error) {
    if (controller.signal.aborted) {
      console.log('EGRUL sync aborted by user');
    } else {
      console.error('Unhandled runEgrulSync error:', error);
    }
  } finally {
    deleteActiveOperation('egrul');
  }
}

/**
 * Handle sanctions-only sync
 */
export async function handleSanctionsSync(): Promise<void> {
  const appState = getAppState();
  if (!appState) return;

  console.log('Command recognized. Triggering sanctions-only sync...');

  if (appState.gracefulShutdownService.isShuttingDown()) {
    console.log('Shutdown in progress, ignoring new sync request');
    return;
  }

  const activeOperations = getActiveOperations();
  if (activeOperations.has('sanctions')) {
    console.log('Sanctions sync already running');
    return;
  }

  const controller = registerOperation('sanctions');

  try {
    const result = await appState.sanctionsOnlyService.run({ abortSignal: controller.signal });

    console.log(`Sanctions sync completed: ${result.status}, processed: ${result.processed}, errors: ${result.errors}`);

    if (result.status === 'error') {
      console.error('Sanctions sync error:', result.message);
    }
  } catch (error) {
    if (controller.signal.aborted) {
      console.log('Sanctions sync aborted by user');
    } else {
      console.error('Sanctions sync error:', error);
    }
  } finally {
    deleteActiveOperation('sanctions');
  }
}

/**
 * Handle cache refresh
 */
export async function handleRefreshCache(): Promise<void> {
  const appState = getAppState();
  if (!appState) return;

  console.log('Command recognized. Triggering companies_meta sync...');

  if (appState.gracefulShutdownService.isShuttingDown()) {
    console.log('Shutdown in progress, ignoring sync request');
    return;
  }

  try {
    // Materialized View обновляется автоматически при INSERT.
    // Этот sync только для companies_meta изменений (director, name, status).
    const { createCompaniesMetaSyncWorker } = await import('shared');

    const worker = createCompaniesMetaSyncWorker();
    const stats = await worker.syncOnce();

    console.log(`Companies meta sync completed: ${stats.innsProcessed} INNs in ${stats.durationMs}ms`);
    if (stats.error) {
      console.error(`Sync error: ${stats.error}`);
    }
  } catch (error) {
    console.error('Companies meta sync error:', error);
  }
}
