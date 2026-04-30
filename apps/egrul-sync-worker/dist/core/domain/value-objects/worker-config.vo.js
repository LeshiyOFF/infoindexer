"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerConfig = void 0;
class WorkerConfig {
    static DEFAULT_POLL_INTERVAL_MS = 30000;
    static DEFAULT_MIN_POLL_INTERVAL_MS = 5000;
    static DEFAULT_MAX_POLL_INTERVAL_MS = 300000;
    static DEFAULT_SHUTDOWN_TIMEOUT_MS = 60000;
    static DEFAULT_TRANSFORM_THRESHOLD_ROWS = 100000;
    pollIntervalMs;
    shutdownTimeoutMs;
    enableMetrics;
    transformThresholdRows;
    constructor(pollIntervalMs = WorkerConfig.DEFAULT_POLL_INTERVAL_MS, shutdownTimeoutMs = WorkerConfig.DEFAULT_SHUTDOWN_TIMEOUT_MS, enableMetrics = true, transformThresholdRows = WorkerConfig.DEFAULT_TRANSFORM_THRESHOLD_ROWS) {
        this.validatePollInterval(pollIntervalMs);
        this.validateShutdownTimeout(shutdownTimeoutMs);
        this.validateTransformThreshold(transformThresholdRows);
        this.pollIntervalMs = pollIntervalMs;
        this.shutdownTimeoutMs = shutdownTimeoutMs;
        this.enableMetrics = enableMetrics;
        this.transformThresholdRows = transformThresholdRows;
    }
    /**
     * Create config for production environment
     *
     * @remarks
     * Factory method for production use case.
     */
    static forProduction() {
        return new WorkerConfig(30000, 60000, true, 100000);
    }
    /**
     * Create config for testing environment
     *
     * @remarks
     * Factory method for testing use case with shorter intervals.
     */
    static forTesting() {
        return new WorkerConfig(1000, 5000, false, 1000);
    }
    /**
     * Create config for development environment
     *
     * @remarks
     * Factory method for development use case.
     */
    static forDevelopment() {
        return new WorkerConfig(10000, 30000, true, 50000);
    }
    validatePollInterval(value) {
        if (value < WorkerConfig.DEFAULT_MIN_POLL_INTERVAL_MS ||
            value > WorkerConfig.DEFAULT_MAX_POLL_INTERVAL_MS) {
            throw new RangeError(`pollIntervalMs must be between ${WorkerConfig.DEFAULT_MIN_POLL_INTERVAL_MS} ` +
                `and ${WorkerConfig.DEFAULT_MAX_POLL_INTERVAL_MS}`);
        }
    }
    validateShutdownTimeout(value) {
        if (value < 1000 || value > 300000) {
            throw new RangeError('shutdownTimeoutMs must be between 1s and 300s');
        }
    }
    validateTransformThreshold(value) {
        if (value < 1 || value > 10000000) {
            throw new RangeError('transformThresholdRows must be between 1 and 10M');
        }
    }
}
exports.WorkerConfig = WorkerConfig;
