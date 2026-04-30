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

export class WorkerConfig {
  private static readonly DEFAULT_POLL_INTERVAL_MS = 30000;
  private static readonly DEFAULT_MIN_POLL_INTERVAL_MS = 5000;
  private static readonly DEFAULT_MAX_POLL_INTERVAL_MS = 300000;
  private static readonly DEFAULT_SHUTDOWN_TIMEOUT_MS = 60000;
  private static readonly DEFAULT_TRANSFORM_THRESHOLD_ROWS = 100000;

  readonly pollIntervalMs: number;
  readonly shutdownTimeoutMs: number;
  readonly enableMetrics: boolean;
  readonly transformThresholdRows: number;

  constructor(
    pollIntervalMs: number = WorkerConfig.DEFAULT_POLL_INTERVAL_MS,
    shutdownTimeoutMs: number = WorkerConfig.DEFAULT_SHUTDOWN_TIMEOUT_MS,
    enableMetrics: boolean = true,
    transformThresholdRows: number = WorkerConfig.DEFAULT_TRANSFORM_THRESHOLD_ROWS
  ) {
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
  static forProduction(): WorkerConfig {
    return new WorkerConfig(30000, 60000, true, 100000);
  }

  /**
   * Create config for testing environment
   *
   * @remarks
   * Factory method for testing use case with shorter intervals.
   */
  static forTesting(): WorkerConfig {
    return new WorkerConfig(1000, 5000, false, 1000);
  }

  /**
   * Create config for development environment
   *
   * @remarks
   * Factory method for development use case.
   */
  static forDevelopment(): WorkerConfig {
    return new WorkerConfig(10000, 30000, true, 50000);
  }

  private validatePollInterval(value: number): void {
    if (value < WorkerConfig.DEFAULT_MIN_POLL_INTERVAL_MS ||
        value > WorkerConfig.DEFAULT_MAX_POLL_INTERVAL_MS) {
      throw new RangeError(
        `pollIntervalMs must be between ${WorkerConfig.DEFAULT_MIN_POLL_INTERVAL_MS} ` +
        `and ${WorkerConfig.DEFAULT_MAX_POLL_INTERVAL_MS}`
      );
    }
  }

  private validateShutdownTimeout(value: number): void {
    if (value < 1000 || value > 300000) {
      throw new RangeError('shutdownTimeoutMs must be between 1s and 300s');
    }
  }

  private validateTransformThreshold(value: number): void {
    if (value < 1 || value > 10000000) {
      throw new RangeError('transformThresholdRows must be between 1 and 10M');
    }
  }
}
