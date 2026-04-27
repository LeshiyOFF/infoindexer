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
export class BatchConfig {
  private static readonly DEFAULT_BATCH_SIZE = 5_000_000;
  private static readonly MIN_BATCH_SIZE = 1_000_000;
  private static readonly MAX_BATCH_SIZE = 10_000_000;
  private static readonly TARGET_MEMORY_PER_BATCH_MB = 250;

  readonly batchSize: number;
  readonly maxMemoryUsage: number;
  readonly maxExecutionTime: number;

  constructor(
    batchSize: number = BatchConfig.DEFAULT_BATCH_SIZE,
    maxMemoryUsage: number = 6_000_000_000,
    maxExecutionTime: number = 120
  ) {
    this.validateBatchSize(batchSize);
    this.batchSize = batchSize;
    this.maxMemoryUsage = maxMemoryUsage;
    this.maxExecutionTime = maxExecutionTime;
  }

  /**
   * Вычисляет количество батчей для общего числа записей
   *
   * @param totalRecords - общее количество записей
   * @returns количество батчей (округлённое вверх)
   */
  getBatchCount(totalRecords: number): number {
    return Math.ceil(totalRecords / this.batchSize);
  }

  /**
   * Вычисляет смещение для батча по индексу
   *
   * @param batchIndex - индекс батча (начиная с 0)
   * @returns смещение (OFFSET) для SQL запроса
   */
  getOffset(batchIndex: number): number {
    return batchIndex * this.batchSize;
  }

  /**
   * Создаёт оптимальную конфигурацию для количества записей
   *
   * @param totalRecords - общее количество записей
   * @returns конфигурация с оптимальным размером батча
   */
  static optimalFor(totalRecords: number): BatchConfig {
    const targetBatches = Math.max(32, Math.ceil(totalRecords / 10_000_000));
    const optimalSize = Math.ceil(totalRecords / targetBatches);
    const clampedSize = Math.min(
      BatchConfig.MAX_BATCH_SIZE,
      Math.max(BatchConfig.MIN_BATCH_SIZE, optimalSize)
    );
    return new BatchConfig(clampedSize);
  }

  private validateBatchSize(size: number): void {
    if (size < BatchConfig.MIN_BATCH_SIZE || size > BatchConfig.MAX_BATCH_SIZE) {
      throw new Error(
        `Batch size must be between ${BatchConfig.MIN_BATCH_SIZE} and ${BatchConfig.MAX_BATCH_SIZE}`
      );
    }
  }
}
