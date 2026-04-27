/**
 * Entry point для sync-worker
 *
 * @remarks
 * Запускает обработчики сообщений Redis pub/sub.
 * Использует Factory для создания зависимостей.
 * Обеспечивает корректный graceful shutdown с сохранением чекпоинтов.
 *
 * Миграции применяются отдельным migration-worker сервисом.
 */

import { SyncFactory } from './core/factories/sync.factory';
import { ActiveSyncsManager } from './active-syncs-manager';
import type { SyncStartMessage, SyncAbortMessage, SyncConfig } from './core/types';

const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '20000');
const REPORT_INTERVAL = 5;

const factory = new SyncFactory();
const activeSyncs = new ActiveSyncsManager();
let isShuttingDown = false;

/**
 * Обработчик сообщения sync:start
 */
async function handleSyncStart(message: string): Promise<void> {
  const payload: SyncStartMessage = JSON.parse(message);
  console.log(`Received start command for year: ${payload.year}`);

  const orchestrator = factory.createOrchestrator({
    batchSize: BATCH_SIZE,
    reportInterval: REPORT_INTERVAL
  });

  const controller = activeSyncs.register(payload.year, orchestrator);

  try {
    await orchestrator.syncYear(payload.year, controller.signal);
  } catch (error) {
    console.error(`Sync failed for year ${payload.year}:`, error);
  } finally {
    activeSyncs.unregister(payload.year);
  }
}

/**
 * Обработчик сообщения sync:abort
 */
function handleSyncAbort(message: string): void {
  const payload: SyncAbortMessage = JSON.parse(message);
  console.log(`Received abort command for year: ${payload.year}`);

  const aborted = activeSyncs.abort(payload.year);
  if (!aborted) {
    console.log(`No active sync found for year: ${payload.year}`);
  }
}

/**
 * Инициализация message bus
 */
async function initMessageBus(): Promise<void> {
  const bus = factory.createMessageBus();

  await bus.subscribeMultiple(['sync:start', 'sync:abort'], async (channel, message) => {
    if (channel === 'sync:start') {
      await handleSyncStart(message);
    } else if (channel === 'sync:abort') {
      handleSyncAbort(message);
    }
  });

  console.log('Subscribed successfully! Listening for sync:start, sync:abort');
}

/**
 * Graceful shutdown
 *
 * @remarks
 * При получении сигнала:
 * 1. Сохраняет чекпоинты активных синхронизаций
 * 2. Прерывает активные синхронизации
 * 3. Закрывает ресурсы
 */
async function gracefulShutdown(signal: string): Promise<void> {
  if (isShuttingDown) {
    console.warn('Shutdown already in progress');
    return;
  }

  isShuttingDown = true;
  const shutdownStart = Date.now();

  console.log(`Received ${signal}, shutting down gracefully`);

  try {
    if (activeSyncs.hasActiveSyncs()) {
      console.log(`Saving checkpoints for ${activeSyncs.count} active sync(s)...`);
      await activeSyncs.saveAllCheckpoints();
      console.log('Checkpoints saved');

      console.log('Aborting active syncs...');
      activeSyncs.abortAll();
    }

    console.log('Closing resources...');
    await factory.shutdown();

    const elapsed = Date.now() - shutdownStart;
    console.log(`Graceful shutdown completed in ${elapsed}ms`);
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Запускаем обработчик сообщений
initMessageBus().catch(console.error);
