/**
 * Value Object для конфигурации батч-обработки
 *
 * @remarks
 * Immutable конфигурация для обработки больших датасетов чанками.
 * Следует SRP: отвечает только за параметры батчинга.
 * Следует Value Object pattern: equality by value, no identity.
 *
 * Memory calculation:
 * - Total records / batch_size = number of batches
 * - Memory per batch = total_memory / number_of_batches
 * - Safety: actual per batch < 250MB target
 *
 * @example
 * ```ts
 * const config = new BatchConfig();
 * const batches = config.getBatchCount(50_000_000); // 10
 * const offset = config.getOffset(5); // 25_000_000
 * ```
 */
export declare class BatchConfig {
    private static readonly DEFAULT_BATCH_SIZE;
    private static readonly MIN_BATCH_SIZE;
    private static readonly MAX_BATCH_SIZE;
    private static readonly TARGET_MEMORY_PER_BATCH_MB;
    readonly batchSize: number;
    readonly maxMemoryUsage: number;
    readonly maxExecutionTime: number;
    constructor(batchSize?: number, maxMemoryUsage?: number, maxExecutionTime?: number);
    /**
     * Вычисляет количество батчей для общего числа записей
     *
     * @param totalRecords - общее количество записей
     * @returns количество батчей (округлённое вверх)
     */
    getBatchCount(totalRecords: number): number;
    /**
     * Вычисляет смещение для батча по индексу
     *
     * @param batchIndex - индекс батча (начиная с 0)
     * @returns смещение (OFFSET) для SQL запроса
     */
    getOffset(batchIndex: number): number;
    /**
     * Создаёт оптимальную конфигурацию для количества записей
     *
     * @param totalRecords - общее количество записей
     * @returns конфигурация с оптимальным размером батча
     */
    static optimalFor(totalRecords: number): BatchConfig;
    private validateBatchSize;
}
