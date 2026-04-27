/**
 * Port для батч-обработки больших датасетов
 *
 * @remarks
 * Абстрагирует сложность обработки данных чанками.
 * Следует Dependency Inversion: infrastructure зависит от этого port.
 * Следует Interface Segregation: сфокусированный, single-purpose интерфейс.
 *
 * @example
 * ```ts
 * const result = await processor.processInBatches(
 *   'SELECT * FROM table LIMIT {limit} OFFSET {offset}',
 *   config,
 *   (p) => console.log(`${p.percentage}%`)
 * );
 * ```
 */
export interface IBatchProcessorPort {
    /**
     * Выполняет запрос батчами
     *
     * @param query - SQL запрос с плейсхолдерами {offset} и {limit}
     * @param config - конфигурация батчинга
     * @param progressCallback - callback после каждого батча
     * @returns результат с общим числом обработанных строк и временем
     *
     * @throws Error если батч-обработка fails
     *
     * @remarks
     * Плейсхолдеры в query:
     * - {offset} - смещение для OFFSET clause
     * - {limit} - размер батча для LIMIT clause
     * - {limit:UInt32} - типизированный вариант для ClickHouse
     */
    processInBatches(query: string, config: BatchConfig, progressCallback?: (progress: BatchProgress) => void): Promise<BatchResult>;
}
/**
 * Прогресс батч-обработки
 *
 * @remarks
 * Передаётся в progressCallback для отслеживания выполнения.
 */
export interface BatchProgress {
    /** Индекс текущего батча (начиная с 0) */
    readonly batchIndex: number;
    /** Общее количество батчей */
    readonly totalBatches: number;
    /** Количество обработанных строк */
    readonly processedRows: number;
    /** Общее количество строк для обработки */
    readonly totalRows: number;
    /** Процент выполнения (0-100) */
    readonly percentage: number;
}
/**
 * Результат батч-обработки
 *
 * @remarks
 * Возвращается после завершения всех батчей.
 */
export interface BatchResult {
    /** Общее количество обработанных строк */
    readonly totalRows: number;
    /** Длительность обработки в миллисекундах */
    readonly durationMs: number;
    /** Количество обработанных батчей */
    readonly batchesProcessed: number;
}
import type { BatchConfig } from '../../domain/value-objects/batch-config.vo';
