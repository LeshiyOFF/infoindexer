/**
 * Adapter для батч-обработки в ClickHouse
 *
 * @remarks
 * Реализует IBatchProcessorPort для ClickHouse.
 * Разбивает большие SELECT запросы на управляемые чанки.
 * Следует SRP: отвечает только за ClickHouse batch операции.
 * Следует DRY: переиспользуется для любой batch INSERT SELECT операции.
 *
 * Memory profile:
 * - До: 5-7GB за один запрос → OOM
 * - После: ~200MB за батч → в пределах лимитов
 *
 * @example
 * ```ts
 * const adapter = new ClickHouseBatchAdapter(client, metrics);
 * const result = await adapter.processInBatches(query, config);
 * console.log(`Processed ${result.totalRows} rows in ${result.durationMs}ms`);
 * ```
 */

import type { ClickHouseClient } from '@clickhouse/client';
import type {
  IBatchProcessorPort,
  BatchProgress,
  BatchResult
} from '../ports/i-batch-processor.port';
import type { BatchConfig } from '../../domain/value-objects/batch-config.vo';
import type { IMetricsCollectorPort } from '../../ports/i-metrics-collector.port';

/**
 * Adapter для батч-обработки в ClickHouse с поддержкой метрик
 *
 * @remarks
 * Метрики опциональны для обратной совместимости.
 * Если не переданы, метрики не собираются.
 */
export class ClickHouseBatchAdapter implements IBatchProcessorPort {
  /**
   * Создаёт адаптер для батч-обработки ClickHouse
   *
   * @param client - ClickHouse клиент
   * @param metrics - Опциональный коллектор метрик
   *
   * @remarks
   * Метрики опциональны для обратной совместимости.
   * Если не переданы, метрики не собираются.
   */
  constructor(
    private readonly client: ClickHouseClient,
    private readonly metrics?: IMetricsCollectorPort
  ) {}

  async processInBatches(
    query: string,
    config: BatchConfig,
    progressCallback?: (progress: BatchProgress) => void
  ): Promise<BatchResult> {
    const startTime = Date.now();
    let totalProcessed = 0;
    let batchIndex = 0;
    let hasMoreData = true;
    let totalErrors = 0;

    const totalRows = await this.getTotalRows(query);
    const totalBatches = config.getBatchCount(totalRows);
    const tableName = this.extractTableName(query);

    while (hasMoreData) {
      const batchStart = Date.now();
      const offset = config.getOffset(batchIndex);
      const batchQuery = this.buildBatchQuery(query, offset, config.batchSize);

      try {
        await this.client.command({
          query: batchQuery
        });

        // Запись метрик успешного батча
        if (this.metrics) {
          const batchDuration = Date.now() - batchStart;
          this.metrics.recordTiming('batch_execute', batchDuration, {
            table: tableName,
            batch_index: batchIndex.toString()
          });
          this.metrics.recordCounter('batch.rows_processed', config.batchSize, { table: tableName });
          this.metrics.recordProgress(
            'batch_progress',
            ((batchIndex + 1) / totalBatches) * 100,
            { table: tableName }
          );
        }

        totalProcessed += config.batchSize;
        batchIndex++;
      } catch (error) {
        totalErrors++;
        if (this.metrics) {
          this.metrics.recordCounter('batch.errors', 1, {
            table: tableName,
            error: error instanceof Error ? error.name : 'unknown'
          });
        }
        throw error;
      }

      if (progressCallback) {
        const processed = Math.min(totalProcessed, totalRows);
        progressCallback({
          batchIndex,
          totalBatches,
          processedRows: processed,
          totalRows,
          percentage: (processed / totalRows) * 100
        });
      }

      hasMoreData = totalProcessed < totalRows;
    }

    const finalDuration = Date.now() - startTime;

    // Финальные метрики
    if (this.metrics) {
      this.metrics.recordCounter('batch.total', batchIndex, {
        table: tableName,
        status: totalErrors === 0 ? 'success' : 'partial_failure'
      });
      this.metrics.recordTiming('batch.total_duration_ms', finalDuration, { table: tableName });
      this.metrics.recordMemoryMetrics({ operation: 'batch_complete', table: tableName });
    }

    return {
      totalRows: Math.min(totalProcessed, totalRows),
      durationMs: finalDuration,
      batchesProcessed: batchIndex
    };
  }

  /**
   * Подставляет значения offset и limit в query
   *
   * @param query - SQL query с плейсхолдерами
   * @param offset - смещение для OFFSET
   * @param limit - размер батча для LIMIT
   * @returns query с подставленными значениями
   */
  private buildBatchQuery(query: string, offset: number, limit: number): string {
    return query
      .replace('{offset}', offset.toString())
      .replace('{limit}', limit.toString())
      .replace('{limit:UInt32}', limit.toString());
  }

  /**
   * Получает общее количество строк для query
   *
   * @param query - SQL query для анализа
   * @returns количество строк в source таблице
   * @throws Error если не удаётся определить таблицу
   */
  private async getTotalRows(query: string): Promise<number> {
    const fromMatch = query.match(/FROM\s+(\S+)/i);
    if (!fromMatch) {
      throw new Error('Cannot determine table for row count');
    }

    const tableName = fromMatch[1].split(' ')[0];
    const countQuery = `SELECT count() as cnt FROM ${tableName}`;
    const result = await this.client.query({
      query: countQuery,
      format: 'JSONEachRow'
    });

    const rows = await result.json() as { cnt: string }[];
    return parseInt(rows[0].cnt, 10);
  }

  /**
   * Извлекает имя таблицы из SQL запроса
   *
   * @param query - SQL query
   * @returns Имя таблицы или 'unknown'
   *
   * @remarks
   * Приватный метод для извлечения имени таблицы из меток.
   * DRY: используется в нескольких местах для метрик.
   */
  private extractTableName(query: string): string {
    const fromMatch = query.match(/FROM\s+(\S+)/i);
    return fromMatch ? fromMatch[1].split(' ')[0] : 'unknown';
  }
}
