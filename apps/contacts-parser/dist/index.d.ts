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
export {};
