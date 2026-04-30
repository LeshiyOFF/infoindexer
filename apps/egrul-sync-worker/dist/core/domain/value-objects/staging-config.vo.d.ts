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
export declare class StagingConfig {
    private static readonly DEFAULT_TRANSFORM_THRESHOLD;
    private static readonly DEFAULT_MAX_MEMORY_BYTES;
    private static readonly DEFAULT_TIMEOUT_MS;
    private static readonly MIN_TRANSFORM_THRESHOLD;
    private static readonly MAX_TRANSFORM_THRESHOLD;
    readonly transformThreshold: number;
    readonly maxMemoryBytes: number;
    readonly timeoutMs: number;
    constructor(transformThreshold?: number, maxMemoryBytes?: number, timeoutMs?: number);
    /**
     * Create config for production environment
     *
     * @remarks
     * Factory method for production use case.
     */
    static forProduction(): StagingConfig;
    /**
     * Create config for testing environment
     *
     * @remarks
     * Factory method for testing use case with smaller thresholds.
     */
    static forTesting(): StagingConfig;
    private validateTransformThreshold;
    private validateMaxMemory;
    private validateTimeout;
}
