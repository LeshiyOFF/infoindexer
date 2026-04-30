/**
 * Adapters — экспорт адаптеров слоя Infrastructure
 *
 * @remarks
 * Adapter — реализация Port из Domain Core.
 * Подключает Domain к внешним системам (Redis, ClickHouse).
 */
export * from './dadata-adapter';
export * from './resume-state-redis-clickhouse.adapter';
export * from './clickhouse-migration.adapter';
