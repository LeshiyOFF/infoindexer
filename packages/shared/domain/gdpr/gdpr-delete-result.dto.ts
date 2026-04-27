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
export class GdprDeleteResult {
  private constructor(
    public readonly success: boolean,
    public readonly inn: string,
    public readonly counts: DeletionCounts,
    public readonly errors: readonly TableError[] = []
  ) {}

  /**
   * Create successful result
   *
   * @param inn - Organization INN
   * @param counts - Deletion counts
   */
  static success(inn: string, counts: DeletionCounts): GdprDeleteResult {
    return new GdprDeleteResult(true, inn, counts, []);
  }

  /**
   * Create failed result
   *
   * @param inn - Organization INN
   * @param errors - Table-specific errors
   */
  static failure(inn: string, errors: TableError[]): GdprDeleteResult {
    const emptyCounts: DeletionCounts = {
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
  static confirmation(inn: string, counts: DeletionCounts): GdprDeleteResult {
    return new GdprDeleteResult(true, inn, counts, []);
  }

  /**
   * Check if has errors
   */
  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  /**
   * Get first error message
   */
  getFirstError(): string | undefined {
    return this.errors[0]?.error;
  }

  /**
   * Convert to plain object for API response
   */
  toResponse(): Readonly<{
    success: boolean;
    inn: string;
    counts: DeletionCounts;
    errors: readonly TableError[];
  }> {
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
export function createDeletionCounts(
  financialReports: number,
  financialSummary: number,
  companiesMeta: number,
  companySanctions: number
): DeletionCounts {
  return {
    financial_reports: financialReports,
    financial_reports_summary: financialSummary,
    companies_meta: companiesMeta,
    company_sanctions: companySanctions,
    total: financialReports + financialSummary + companiesMeta + companySanctions
  };
}
