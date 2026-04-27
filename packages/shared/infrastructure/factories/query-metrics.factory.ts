/**
 * Query Metrics Factory
 *
 * @remarks
 * Factory для создания IQueryMetricsCollector реализаций.
 * Следует SRP: только создание объектов.
 * Следует OCP: можно добавить новые типы без изменения кода.
 */
import { ConsoleQueryMetricsCollector } from '../adapters/console-query-metrics.adapter';
import type { IQueryMetricsCollector } from '../ports/i-query-metrics-collector.port';

/**
 * Создать коллектор метрик с console выводом
 *
 * @returns Экземпляр ConsoleQueryMetricsCollector
 */
export function createQueryMetricsService(): IQueryMetricsCollector {
  return new ConsoleQueryMetricsCollector();
}
