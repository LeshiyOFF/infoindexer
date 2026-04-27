/**
 * Redis Message Handlers
 *
 * @remarks
 * Handles Redis Pub/Sub messages for sync operations.
 * Поддерживает команды: start, abort, health check.
 */
import { redisSub, redisClient } from 'shared';
import { getAppState } from './app-state';
import { handleEgrulSync, handleSanctionsSync, handleRefreshCache } from './sync-handlers';
import { getActiveOperations, deleteActiveOperation } from './shutdown-handlers';

/**
 * Setup Redis subscriptions and message handlers
 */
export function setupRedisSubscriptions(): void {
  const channels = [
    'sync:egrul:start',
    'sync:sanctions:start',
    'sync:refresh:start',
    'sync:egrul:abort',
    'sync:sanctions:abort',
    'sync:health:check'
  ];

  for (const channel of channels) {
    redisSub.subscribe(channel, (err) => {
      if (err) {
        console.error(`Failed to subscribe to ${channel}:`, err);
      } else {
        console.log(`EGRUL Sync Worker: Successfully subscribed to channel "${channel}"`);
      }
    });
  }

  redisSub.on('message', async (channel: string, message: string) => {
    console.log(`Worker received message on channel [${channel}]`);

    if (!getAppState()) {
      console.error('Application not initialized');
      return;
    }

    try {
      switch (channel) {
        case 'sync:egrul:start':
          await handleEgrulSync(message);
          break;
        case 'sync:sanctions:start':
          await handleSanctionsSync();
          break;
        case 'sync:refresh:start':
          await handleRefreshCache();
          break;
        case 'sync:egrul:abort':
          abortOperation('egrul');
          break;
        case 'sync:sanctions:abort':
          abortOperation('sanctions');
          break;
        case 'sync:health:check':
          await handleHealthCheck(message);
          break;
      }
    } catch (error) {
      console.error(`Error handling message on channel [${channel}]:`, error);
    }
  });
}

/**
 * Обработчик health check запросов
 *
 * @remarks
 * Получает health report и публикует в канал sync:health:status.
 */
async function handleHealthCheck(message: string): Promise<void> {
  const state = getAppState();
  if (!state || !state.healthCheckService) {
    console.error('Health check service not initialized');
    await publishHealthError('Health check service not initialized');
    return;
  }

  try {
    const health = await state.healthCheckService.getFullHealth();

    await redisClient.publish(
      'sync:health:status',
      JSON.stringify({
        success: true,
        data: health,
        timestamp: Date.now()
      })
    );

    console.log(`[HealthCheck] Status: ${health.status}, Components: ${Object.keys(health.components).length}`);
  } catch (error) {
    console.error('[HealthCheck] Error:', error);
    await publishHealthError(error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Публикует ошибку health check
 */
async function publishHealthError(message: string): Promise<void> {
  await redisClient.publish(
    'sync:health:status',
    JSON.stringify({
      success: false,
      error: message,
      timestamp: Date.now()
    })
  );
}

/**
 * Register new operation
 */
export function registerOperation(type: 'egrul' | 'sanctions' | 'refresh'): AbortController {
  const controller = new AbortController();
  const activeOperations = getActiveOperations();
  activeOperations.set(type, { controller, type });
  return controller;
}

/**
 * Abort operation by type
 */
export function abortOperation(type: 'egrul' | 'sanctions' | 'refresh'): boolean {
  const activeOperations = getActiveOperations();
  const operation = activeOperations.get(type);

  if (operation) {
    operation.controller.abort();
    deleteActiveOperation(type);
    console.log(`Operation ${type} aborted`);
    return true;
  }

  return false;
}
