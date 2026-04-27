/**
 * EGRUL Sync Worker Entry Point
 *
 * Запускает синхронизацию данных из OpenSanctions/EGRUL:
 * - Полная синхронизация (EGRUL + Санкции)
 * - Только санкции
 *
 * @remarks
 * Поддерживает HTTP Range resume для прерванных загрузок.
 * Graceful shutdown через GracefulShutdownService (SOLID).
 * Resource-Aware Configuration для auto-tuning ClickHouse настроек.
 *
 * Миграции применяются отдельным migration-worker сервисом.
 */
export {};
