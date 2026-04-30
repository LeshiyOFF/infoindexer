/**
 * Staging Transform Result Value Object
 *
 * @remarks
 * Immutable result of staging transformation operation.
 * Follows Value Object pattern: no identity, equality by value.
 *
 * Provides success/failure status and detailed metrics.
 */
export declare class StagingTransformResult {
    readonly directorsProcessed: number;
    readonly foundersProcessed: number;
    private readonly internalErrors;
    readonly durationMs: number;
    private constructor();
    /**
     * Creates a new StagingTransformResult
     *
     * @param directorsProcessed - Number of director records transformed
     * @param foundersProcessed - Number of founder records transformed
     * @param errors - Array of errors encountered during transformation
     * @param durationMs - Total duration in milliseconds
     * @returns Immutable result instance
     */
    static create(directorsProcessed: number, foundersProcessed: number, errors: Error[], durationMs: number): StagingTransformResult;
    /**
     * Creates a successful result
     */
    static success(directorsProcessed: number, foundersProcessed: number, durationMs: number): StagingTransformResult;
    /**
     * Creates a failed result
     */
    static failure(directorsProcessed: number, foundersProcessed: number, error: Error, durationMs: number): StagingTransformResult;
    /**
     * Checks if transformation completed without errors
     */
    get success(): boolean;
    /**
     * Checks if errors occurred during transformation
     */
    get hasErrors(): boolean;
    /**
     * Returns error count
     */
    get errorCount(): number;
    /**
     * Returns readonly array of errors
     */
    get errors(): readonly Error[];
    /**
     * Returns total records processed
     */
    get totalProcessed(): number;
}
