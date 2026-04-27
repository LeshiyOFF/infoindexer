/**
 * Console Query Metrics Adapter
 *
 * @remarks
 * Console-логирующая реализация IQueryMetricsCollector port.
 * Следует SRP: только сбор метрик в memory + логирование.
 * Следует DIP: реализует IQueryMetricsCollector port.
 * Следует LSP: может быть заменён на Prometheus/Redis adapter.
 *
 * Хранит метрики в memory. Для production использовать персистентный адаптер.
 */
import type {
  IQueryMetricsCollector,
  QueryMetrics
} from '../ports/i-query-metrics-collector.port';

export class ConsoleQueryMetricsCollector implements IQueryMetricsCollector {
  private totalQueries = 0;
  private totalErrors = 0;
  private totalDurationMs = 0;
  private totalRows = 0;

  recordQuery(
    queryName: string,
    durationMs: number,
    rowsAffected: number
  ): void {
    this.totalQueries++;
    this.totalDurationMs += durationMs;
    this.totalRows += rowsAffected;

    console.log(
      `[METRICS] ${queryName}: ${durationMs}ms, ${rowsAffected} rows`
    );
  }

  recordError(queryName: string, error: string): void {
    this.totalErrors++;
    console.error(`[METRICS] ${queryName} ERROR: ${error}`);
  }

  getMetrics(): QueryMetrics | null {
    if (this.totalQueries === 0) {
      return null;
    }

    return {
      totalQueries: this.totalQueries,
      totalErrors: this.totalErrors,
      totalDurationMs: this.totalDurationMs,
      totalRows: this.totalRows
    };
  }

  /**
   * Сбросить накопленные метрики
   */
  reset(): void {
    this.totalQueries = 0;
    this.totalErrors = 0;
    this.totalDurationMs = 0;
    this.totalRows = 0;
  }
}

/**
 * Factory функция для создания ConsoleQueryMetricsCollector
 */
export function createQueryMetricsService(): IQueryMetricsCollector {
  return new ConsoleQueryMetricsCollector();
}
