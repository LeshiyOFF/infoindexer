/**
 * GDPR Delete Result DTO
 *
 * @remarks
 * Domain Layer: Result type for GDPR deletion operations.
 * Part of GDPR/FZ-152 right-to-delete implementation.
 *
 * Architecture:
 * - Domain Layer: result value object
 * - SRP: only represents deletion result
 *
 * Iteration 13: GDPR Right-to-Delete
 */
/**
 * Deletion count per table
 */
export interface DeletionCounts {
    readonly financial_reports: number;
    readonly financial_reports_summary: number;
    readonly companies_meta: number;
    readonly company_sanctions: number;
    readonly total: number;
}
/**
 * Table-specific error
 */
export interface TableError {
    readonly table: string;
    readonly error: string;
}
/**
 * GDPR Delete Result
 *
 * @remarks
 * Represents the result of a GDPR deletion operation.
 * Can be used for both confirmation (counts only) and execution.
 */
export declare class GdprDeleteResult {
    readonly success: boolean;
    readonly inn: string;
    readonly counts: DeletionCounts;
    readonly errors: readonly TableError[];
    private constructor();
    /**
     * Create successful result
     *
     * @param inn - Organization INN
     * @param counts - Deletion counts
     */
    static success(inn: string, counts: DeletionCounts): GdprDeleteResult;
    /**
     * Create failed result
     *
     * @param inn - Organization INN
     * @param errors - Table-specific errors
     */
    static failure(inn: string, errors: TableError[]): GdprDeleteResult;
    /**
     * Create confirmation result (before deletion)
     *
     * @param inn - Organization INN
     * @param counts - Record counts
     */
    static confirmation(inn: string, counts: DeletionCounts): GdprDeleteResult;
    /**
     * Check if has errors
     */
    hasErrors(): boolean;
    /**
     * Get first error message
     */
    getFirstError(): string | undefined;
    /**
     * Convert to plain object for API response
     */
    toResponse(): Readonly<{
        success: boolean;
        inn: string;
        counts: DeletionCounts;
        errors: readonly TableError[];
    }>;
}
/**
 * Create deletion counts from individual table counts
 */
export declare function createDeletionCounts(financialReports: number, financialSummary: number, companiesMeta: number, companySanctions: number): DeletionCounts;
