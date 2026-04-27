/**
 * Staging Transform Result Value Object
 *
 * @remarks
 * Immutable result of staging transformation operation.
 * Follows Value Object pattern: no identity, equality by value.
 *
 * Provides success/failure status and detailed metrics.
 */
export class StagingTransformResult {
  private constructor(
    public readonly directorsProcessed: number,
    public readonly foundersProcessed: number,
    private readonly internalErrors: readonly Error[],
    public readonly durationMs: number
  ) {}

  /**
   * Creates a new StagingTransformResult
   *
   * @param directorsProcessed - Number of director records transformed
   * @param foundersProcessed - Number of founder records transformed
   * @param errors - Array of errors encountered during transformation
   * @param durationMs - Total duration in milliseconds
   * @returns Immutable result instance
   */
  static create(
    directorsProcessed: number,
    foundersProcessed: number,
    errors: Error[],
    durationMs: number
  ): StagingTransformResult {
    return new StagingTransformResult(
      directorsProcessed,
      foundersProcessed,
      Object.freeze(errors),
      durationMs
    );
  }

  /**
   * Creates a successful result
   */
  static success(
    directorsProcessed: number,
    foundersProcessed: number,
    durationMs: number
  ): StagingTransformResult {
    return StagingTransformResult.create(
      directorsProcessed,
      foundersProcessed,
      [],
      durationMs
    );
  }

  /**
   * Creates a failed result
   */
  static failure(
    directorsProcessed: number,
    foundersProcessed: number,
    error: Error,
    durationMs: number
  ): StagingTransformResult {
    return StagingTransformResult.create(
      directorsProcessed,
      foundersProcessed,
      [error],
      durationMs
    );
  }

  /**
   * Checks if transformation completed without errors
   */
  get success(): boolean {
    return this.internalErrors.length === 0;
  }

  /**
   * Checks if errors occurred during transformation
   */
  get hasErrors(): boolean {
    return this.internalErrors.length > 0;
  }

  /**
   * Returns error count
   */
  get errorCount(): number {
    return this.internalErrors.length;
  }

  /**
   * Returns readonly array of errors
   */
  get errors(): readonly Error[] {
    return this.internalErrors;
  }

  /**
   * Returns total records processed
   */
  get totalProcessed(): number {
    return this.directorsProcessed + this.foundersProcessed;
  }
}
