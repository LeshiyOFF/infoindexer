/**
 * Worker Configuration Value Object
 *
 * @remarks
 * Immutable configuration for worker operations.
 * Follows SRP: responsible only for worker parameters.
 * Follows Value Object pattern: no identity, equality by value.
 *
 * @pattern Value Object
 * @pattern Single Responsibility Principle
 */
export declare class WorkerConfig {
    private static readonly DEFAULT_POLL_INTERVAL_MS;
    private static readonly DEFAULT_MIN_POLL_INTERVAL_MS;
    private static readonly DEFAULT_MAX_POLL_INTERVAL_MS;
    private static readonly DEFAULT_SHUTDOWN_TIMEOUT_MS;
    private static readonly DEFAULT_TRANSFORM_THRESHOLD_ROWS;
    readonly pollIntervalMs: number;
    readonly shutdownTimeoutMs: number;
    readonly enableMetrics: boolean;
    readonly transformThresholdRows: number;
    constructor(pollIntervalMs?: number, shutdownTimeoutMs?: number, enableMetrics?: boolean, transformThresholdRows?: number);
    /**
     * Create config for production environment
     *
     * @remarks
     * Factory method for production use case.
     */
    static forProduction(): WorkerConfig;
    /**
     * Create config for testing environment
     *
     * @remarks
     * Factory method for testing use case with shorter intervals.
     */
    static forTesting(): WorkerConfig;
    /**
     * Create config for development environment
     *
     * @remarks
     * Factory method for development use case.
     */
    static forDevelopment(): WorkerConfig;
    private validatePollInterval;
    private validateShutdownTimeout;
    private validateTransformThreshold;
}
