/**
 * OSINT Waterfall Enricher - Entry Point
 *
 * @remarks
 * Главный файл приложения. Создаёт сервисы через Factory,
 * подписывается на Redis pub/sub и запускает обработку задач.
 *
 * @architecture
 * - Factory создаёт все сервисы (Dependency Injection)
 * - QueueService управляет очередью с ограничением concurrency
 * - EnrichmentService выполняет OSINT поиск через Ports/Adapters
 */

import { redisSub, redisClient } from 'shared';
import { ServicesFactory } from './core/services';

// Создаём все сервисы через Factory
const factory = new ServicesFactory();
const queue = factory.createQueue();

// Подписываемся на Redis pub/sub для получения задач
redisSub.subscribe('contacts:parse', (err) => {
  if (!err) {
    console.log('OSINT Waterfall Enricher listening...');
  } else {
    console.error('Failed to subscribe to contacts:parse:', err);
  }
});

// Обработка входящих сообщений
redisSub.on('message', async (_channel, message) => {
  try {
    const data = JSON.parse(message) as { inn: string; batchId?: string };
    queue.enqueue(data.inn, data.batchId);
  } catch (err) {
    console.error('[Queue] Failed to parse message:', err);
  }
});

// Graceful shutdown
const shutdown = async () => {
  console.log('[Shutdown] Closing resources...');
  await factory.shutdown();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
