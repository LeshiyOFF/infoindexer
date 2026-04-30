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
export declare class TransformResult {
    readonly tableName: string;
    readonly rowsProcessed: number;
    readonly durationMs: number;
    readonly success: boolean;
    readonly error?: string;
    private constructor();
    /**
     * Create a successful transform result
     *
     * @param tableName - Name of the transformed table
     * @param rowsProcessed - Number of rows processed
     * @param durationMs - Duration in milliseconds
     * @returns Success result instance
     */
    static success(tableName: string, rowsProcessed: number, durationMs: number): TransformResult;
    /**
     * Create a failure result
     *
     * @param tableName - Name of the table that failed
     * @param error - Error message
     * @returns Failure result instance
     */
    static failure(tableName: string, error: string): TransformResult;
    /**
     * Check if result is successful
     */
    get isSuccessful(): boolean;
    /**
     * Check if result is failed
     */
    get isFailed(): boolean;
    /**
     * Format duration to human readable string
     */
    get formattedDuration(): string;
    /**
     * Get throughput (rows per second)
     */
    get throughput(): number;
}
