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
import type { IBatchProcessorPort, BatchProgress, BatchResult } from '../ports/i-batch-processor.port';
import type { BatchConfig } from '../../domain/value-objects/batch-config.vo';
import type { IMetricsCollectorPort } from '../../ports/i-metrics-collector.port';
/**
 * Adapter для батч-обработки в ClickHouse с поддержкой метрик
 *
 * @remarks
 * Метрики опциональны для обратной совместимости.
 * Если не переданы, метрики не собираются.
 */
export declare class ClickHouseBatchAdapter implements IBatchProcessorPort {
    private readonly client;
    private readonly metrics?;
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
    constructor(client: ClickHouseClient, metrics?: IMetricsCollectorPort | undefined);
    processInBatches(query: string, config: BatchConfig, progressCallback?: (progress: BatchProgress) => void): Promise<BatchResult>;
    /**
     * Подставляет значения offset и limit в query
     *
     * @param query - SQL query с плейсхолдерами
     * @param offset - смещение для OFFSET
     * @param limit - размер батча для LIMIT
     * @returns query с подставленными значениями
     */
    private buildBatchQuery;
    /**
     * Получает общее количество строк для query
     *
     * @param query - SQL query для анализа
     * @returns количество строк в source таблице
     * @throws Error если не удаётся определить таблицу
     */
    private getTotalRows;
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
    private extractTableName;
}
