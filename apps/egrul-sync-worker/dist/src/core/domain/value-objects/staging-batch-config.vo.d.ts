/**
 * Staging Batch Configuration Value Object
 *
 * @remarks
 * Immutable configuration for staging batch processing.
 * Follows Value Object pattern: no identity, equality by value.
 *
 * Provides safe batch size constraints and factory methods.
 */
export declare class StagingBatchConfig {
    readonly batchSize: number;
    readonly maxConcurrent: number;
    private static readonly DEFAULT_SIZE;
    private static readonly MIN_SIZE;
    private static readonly MAX_SIZE;
    private static readonly DEFAULT_CONCURRENT;
    private static readonly MAX_CONCURRENT;
    private constructor();
    /**
     * Creates a new StagingBatchConfig with validation
     *
     * @param batchSize - Number of records per batch (1K-50K)
     * @param maxConcurrent - Maximum concurrent operations (1-10)
     * @returns Immutable config instance
     * @throws RangeError if parameters are out of valid range
     */
    static create(batchSize?: number, maxConcurrent?: number): StagingBatchConfig;
    /**
     * Creates config for small batches (high frequency, low latency)
     */
    static small(): StagingBatchConfig;
    /**
     * Creates config for large batches (low frequency, high throughput)
     */
    static large(): StagingBatchConfig;
    /**
     * Returns new config with different batch size
     */
    withBatchSize(size: number): StagingBatchConfig;
    /**
     * Returns new config with different concurrency
     */
    withConcurrent(concurrent: number): StagingBatchConfig;
    /**
     * Calculates chunk count for given total records
     */
    getChunkCount(totalRecords: number): number;
    /**
     * Calculates offset for given chunk index
     */
    getOffset(chunkIndex: number): number;
    private static validateBatchSize;
    private static validateConcurrent;
}
