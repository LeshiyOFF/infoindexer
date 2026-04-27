import type { IQueryMetricsCollector } from '../ports/i-query-metrics-collector.port';
/**
 * Создать коллектор метрик с console выводом
 *
 * @returns Экземпляр ConsoleQueryMetricsCollector
 */
export declare function createQueryMetricsService(): IQueryMetricsCollector;
