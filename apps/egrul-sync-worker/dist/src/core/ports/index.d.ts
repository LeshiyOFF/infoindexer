/**
 * Ports — экспорт интерфейсов слоя Ports
 *
 * @remarks
 * Port — это интерфейс в Domain Core.
 * Определяет контракт между Domain и Infrastructure.
 */
export * from './i-resume-state-storage.port';
export * from './i-graceful-shutdown.port';
export * from './i-migration-runner.port';
export * from './i-sync-state-storage.port';
export * from './i-metrics-collector.port';
export * from './i-circuit-breaker.port';
export * from './i-circuit-breaker-events.port';
export * from './i-circuit-breaker-manager.port';
export * from './i-mv-insert.port';
export * from './i-direct-insert.port';
