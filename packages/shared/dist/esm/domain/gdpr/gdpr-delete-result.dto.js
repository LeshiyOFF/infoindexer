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
 * GDPR Delete Result
 *
 * @remarks
 * Represents the result of a GDPR deletion operation.
 * Can be used for both confirmation (counts only) and execution.
 */
export class GdprDeleteResult {
    success;
    inn;
    counts;
    errors;
    constructor(success, inn, counts, errors = []) {
        this.success = success;
        this.inn = inn;
        this.counts = counts;
        this.errors = errors;
    }
    /**
     * Create successful result
     *
     * @param inn - Organization INN
     * @param counts - Deletion counts
     */
    static success(inn, counts) {
        return new GdprDeleteResult(true, inn, counts, []);
    }
    /**
     * Create failed result
     *
     * @param inn - Organization INN
     * @param errors - Table-specific errors
     */
    static failure(inn, errors) {
        const emptyCounts = {
            financial_reports: 0,
            financial_reports_summary: 0,
            companies_meta: 0,
            company_sanctions: 0,
            total: 0
        };
        return new GdprDeleteResult(false, inn, emptyCounts, errors);
    }
    /**
     * Create confirmation result (before deletion)
     *
     * @param inn - Organization INN
     * @param counts - Record counts
     */
    static confirmation(inn, counts) {
        return new GdprDeleteResult(true, inn, counts, []);
    }
    /**
     * Check if has errors
     */
    hasErrors() {
        return this.errors.length > 0;
    }
    /**
     * Get first error message
     */
    getFirstError() {
        return this.errors[0]?.error;
    }
    /**
     * Convert to plain object for API response
     */
    toResponse() {
        return {
            success: this.success,
            inn: this.inn,
            counts: this.counts,
            errors: this.errors
        };
    }
}
/**
 * Create deletion counts from individual table counts
 */
export function createDeletionCounts(financialReports, financialSummary, companiesMeta, companySanctions) {
    return {
        financial_reports: financialReports,
        financial_reports_summary: financialSummary,
        companies_meta: companiesMeta,
        company_sanctions: companySanctions,
        total: financialReports + financialSummary + companiesMeta + companySanctions
    };
}
