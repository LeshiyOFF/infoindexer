/**
 * Transform Result DTO
 *
 * @remarks
 * Data Transfer Object for staging → production transformation result.
 * Contains metrics and status information for a single transform operation.
 *
 * @pattern Data Transfer Object
 * @pattern Single Responsibility Principle
 * @pattern Immutable Object Pattern
 */
export class TransformResult {
  readonly tableName: string;
  readonly rowsProcessed: number;
  readonly durationMs: number;
  readonly success: boolean;
  readonly error?: string;

  private constructor(
    tableName: string,
    rowsProcessed: number,
    durationMs: number,
    success: boolean,
    error?: string
  ) {
    this.tableName = tableName;
    this.rowsProcessed = rowsProcessed;
    this.durationMs = durationMs;
    this.success = success;
    this.error = error;
  }

  /**
   * Create a successful transform result
   *
   * @param tableName - Name of the transformed table
   * @param rowsProcessed - Number of rows processed
   * @param durationMs - Duration in milliseconds
   * @returns Success result instance
   */
  static success(
    tableName: string,
    rowsProcessed: number,
    durationMs: number
  ): TransformResult {
    return new TransformResult(tableName, rowsProcessed, durationMs, true);
  }

  /**
   * Create a failure result
   *
   * @param tableName - Name of the table that failed
   * @param error - Error message
   * @returns Failure result instance
   */
  static failure(tableName: string, error: string): TransformResult {
    return new TransformResult(tableName, 0, 0, false, error);
  }

  /**
   * Check if result is successful
   */
  get isSuccessful(): boolean {
    return this.success;
  }

  /**
   * Check if result is failed
   */
  get isFailed(): boolean {
    return !this.success;
  }

  /**
   * Format duration to human readable string
   */
  get formattedDuration(): string {
    const seconds = this.durationMs / 1000;
    if (seconds < 1) {
      return `${this.durationMs}ms`;
    }
    if (seconds < 60) {
      return `${seconds.toFixed(2)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = (seconds % 60).toFixed(0);
    return `${minutes}m ${remainingSeconds}s`;
  }

  /**
   * Get throughput (rows per second)
   */
  get throughput(): number {
    if (this.durationMs === 0) {
      return 0;
    }
    return (this.rowsProcessed / this.durationMs) * 1000;
  }
}
