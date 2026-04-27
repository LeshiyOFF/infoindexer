"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const shared_1 = require("shared");
const services_1 = require("./core/services");
// Создаём все сервисы через Factory
const factory = new services_1.ServicesFactory();
const queue = factory.createQueue();
// Подписываемся на Redis pub/sub для получения задач
shared_1.redisSub.subscribe('contacts:parse', (err) => {
    if (!err) {
        console.log('OSINT Waterfall Enricher listening...');
    }
    else {
        console.error('Failed to subscribe to contacts:parse:', err);
    }
});
// Обработка входящих сообщений
shared_1.redisSub.on('message', async (_channel, message) => {
    try {
        const data = JSON.parse(message);
        queue.enqueue(data.inn, data.batchId);
    }
    catch (err) {
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
