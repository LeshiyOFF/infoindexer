/**
 * Redis Message Handlers
 *
 * @remarks
 * Handles Redis Pub/Sub messages for sync operations.
 * Поддерживает команды: start, abort, health check.
 *
 * Iteration 5: Использует RedisSubscriptionManager для автоматической
 * переподписки при потере соединения.
 */
import { redisSub, redisClient } from 'shared';
import { createRedisSubscriptionManager } from './core/infrastructure/factories/redis-subscription-manager.factory';
import type { RedisSubscriptionManagerAdapter } from './core/infrastructure/adapters/redis-subscription-manager.adapter';
import { getAppState } from './app-state';
import { handleEgrulSync, handleSanctionsSync, handleRefreshCache } from './sync-handlers';
import { getActiveOperations, deleteActiveOperation } from './shutdown-handlers';

const CHANNELS = [
  'sync:egrul:start',
  'sync:sanctions:start',
  'sync:refresh:start',
  'sync:egrul:abort',
  'sync:sanctions:abort',
  'sync:health:check'
];

let subscriptionManager: RedisSubscriptionManagerAdapter | null = null;

/**
 * Setup Redis subscriptions и message handlers
 *
 * @remarks
 * Создаёт SubscriptionManager и подписывается на каналы.
 * Автоматически переподписывается при reconnect.
 */
export async function setupRedisSubscriptions(): Promise<void> {
  if (subscriptionManager) {
    console.warn('[RedisHandlers] SubscriptionManager already initialized');
    return;
  }

  const logger = {
    info: (msg: string) => console.info(msg),
    warn: (msg: string) => console.warn(msg),
    error: (msg: string, err?: Error) => console.error(msg, err)
  };

  subscriptionManager = createRedisSubscriptionManager(redisSub, logger);

  try {
    await subscriptionManager.subscribe(CHANNELS);

    redisSub.on('message', async (channel: string, message: string) => {
      console.log(`[RedisHandlers] Worker received message on channel [${channel}]`);

      if (!getAppState()) {
        console.error('[RedisHandlers] Application not initialized');
        return;
      }

      try {
        await handleChannelMessage(channel, message);
      } catch (error) {
        console.error(`[RedisHandlers] Error handling message on channel [${channel}]:`, error);
      }
    });

    console.log('[RedisHandlers] Redis subscriptions setup complete');
  } catch (error) {
    console.error('[RedisHandlers] Failed to setup subscriptions:', error);
    subscriptionManager = null;
    throw error;
  }
}

async function handleChannelMessage(channel: string, message: string): Promise<void> {
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
    default:
      console.warn(`[RedisHandlers] Unknown channel: ${channel}`);
  }
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
    console.error('[RedisHandlers] Health check service not initialized');
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

export function registerOperation(type: 'egrul' | 'sanctions' | 'refresh'): AbortController {
  const controller = new AbortController();
  const activeOperations = getActiveOperations();
  activeOperations.set(type, { controller, type });
  return controller;
}

export function abortOperation(type: 'egrul' | 'sanctions' | 'refresh'): boolean {
  const activeOperations = getActiveOperations();
  const operation = activeOperations.get(type);

  if (operation) {
    operation.controller.abort();
    deleteActiveOperation(type);
    console.log(`[RedisHandlers] Operation ${type} aborted`);
    return true;
  }

  return false;
}

export function getSubscriptionManager(): RedisSubscriptionManagerAdapter | null {
  return subscriptionManager;
}

export async function stopRedisSubscriptions(): Promise<void> {
  if (subscriptionManager) {
    await subscriptionManager.stop();
    subscriptionManager = null;
  }
}
