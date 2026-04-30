"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StagingConfig = void 0;
/**
 * Staging Configuration Value Object
 *
 * @remarks
 * Immutable configuration for staging operations.
 * Follows SRP: responsible only for staging parameters.
 * Follows Value Object pattern: no identity, equality by value.
 *
 * Default values based on testing with 43M rows:
 * - transformThreshold: 100,000 rows (balance between latency and throughput)
 * - maxMemoryBytes: 2GB (safe limit for transform)
 * - timeoutMs: 300,000ms (5 minutes per operation)
 *
 * @pattern Value Object
 * @pattern Single Responsibility Principle
 */
class StagingConfig {
    static DEFAULT_TRANSFORM_THRESHOLD = 100000;
    static DEFAULT_MAX_MEMORY_BYTES = 2000000000;
    static DEFAULT_TIMEOUT_MS = 300000;
    static MIN_TRANSFORM_THRESHOLD = 10000;
    static MAX_TRANSFORM_THRESHOLD = 1000000;
    transformThreshold;
    maxMemoryBytes;
    timeoutMs;
    constructor(transformThreshold = StagingConfig.DEFAULT_TRANSFORM_THRESHOLD, maxMemoryBytes = StagingConfig.DEFAULT_MAX_MEMORY_BYTES, timeoutMs = StagingConfig.DEFAULT_TIMEOUT_MS) {
        this.validateTransformThreshold(transformThreshold);
        this.validateMaxMemory(maxMemoryBytes);
        this.validateTimeout(timeoutMs);
        this.transformThreshold = transformThreshold;
        this.maxMemoryBytes = maxMemoryBytes;
        this.timeoutMs = timeoutMs;
    }
    /**
     * Create config for production environment
     *
     * @remarks
     * Factory method for production use case.
     */
    static forProduction() {
        return new StagingConfig(100000, 2000000000, 300000);
    }
    /**
     * Create config for testing environment
     *
     * @remarks
     * Factory method for testing use case with smaller thresholds.
     */
    static forTesting() {
        return new StagingConfig(1000, 100000000, 10000);
    }
    validateTransformThreshold(value) {
        if (value < StagingConfig.MIN_TRANSFORM_THRESHOLD ||
            value > StagingConfig.MAX_TRANSFORM_THRESHOLD) {
            throw new RangeError(`transformThreshold must be between ${StagingConfig.MIN_TRANSFORM_THRESHOLD} ` +
                `and ${StagingConfig.MAX_TRANSFORM_THRESHOLD}`);
        }
    }
    validateMaxMemory(value) {
        if (value < 100000000 || value > 10000000000) {
            throw new RangeError('maxMemoryBytes must be between 100MB and 10GB');
        }
    }
    validateTimeout(value) {
        if (value < 1000 || value > 600000) {
            throw new RangeError('timeoutMs must be between 1s and 600s');
        }
    }
}
exports.StagingConfig = StagingConfig;
