"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StagingBatchConfig = void 0;
/**
 * Staging Batch Configuration Value Object
 *
 * @remarks
 * Immutable configuration for staging batch processing.
 * Follows Value Object pattern: no identity, equality by value.
 *
 * Provides safe batch size constraints and factory methods.
 */
class StagingBatchConfig {
    batchSize;
    maxConcurrent;
    static DEFAULT_SIZE = 10_000;
    static MIN_SIZE = 1_000;
    static MAX_SIZE = 50_000;
    static DEFAULT_CONCURRENT = 3;
    static MAX_CONCURRENT = 10;
    constructor(batchSize, maxConcurrent) {
        this.batchSize = batchSize;
        this.maxConcurrent = maxConcurrent;
    }
    /**
     * Creates a new StagingBatchConfig with validation
     *
     * @param batchSize - Number of records per batch (1K-50K)
     * @param maxConcurrent - Maximum concurrent operations (1-10)
     * @returns Immutable config instance
     * @throws RangeError if parameters are out of valid range
     */
    static create(batchSize = StagingBatchConfig.DEFAULT_SIZE, maxConcurrent = StagingBatchConfig.DEFAULT_CONCURRENT) {
        StagingBatchConfig.validateBatchSize(batchSize);
        StagingBatchConfig.validateConcurrent(maxConcurrent);
        return new StagingBatchConfig(batchSize, maxConcurrent);
    }
    /**
     * Creates config for small batches (high frequency, low latency)
     */
    static small() {
        return StagingBatchConfig.create(1_000, 5);
    }
    /**
     * Creates config for large batches (low frequency, high throughput)
     */
    static large() {
        return StagingBatchConfig.create(50_000, 2);
    }
    /**
     * Returns new config with different batch size
     */
    withBatchSize(size) {
        return StagingBatchConfig.create(size, this.maxConcurrent);
    }
    /**
     * Returns new config with different concurrency
     */
    withConcurrent(concurrent) {
        return StagingBatchConfig.create(this.batchSize, concurrent);
    }
    /**
     * Calculates chunk count for given total records
     */
    getChunkCount(totalRecords) {
        return Math.ceil(totalRecords / this.batchSize);
    }
    /**
     * Calculates offset for given chunk index
     */
    getOffset(chunkIndex) {
        return chunkIndex * this.batchSize;
    }
    static validateBatchSize(size) {
        if (size < StagingBatchConfig.MIN_SIZE || size > StagingBatchConfig.MAX_SIZE) {
            throw new RangeError(`batchSize must be between ${StagingBatchConfig.MIN_SIZE} and ${StagingBatchConfig.MAX_SIZE}, got ${size}`);
        }
    }
    static validateConcurrent(concurrent) {
        if (concurrent < 1 || concurrent > StagingBatchConfig.MAX_CONCURRENT) {
            throw new RangeError(`maxConcurrent must be between 1 and ${StagingBatchConfig.MAX_CONCURRENT}, got ${concurrent}`);
        }
    }
}
exports.StagingBatchConfig = StagingBatchConfig;
