/**
 * ClickHouse GDPR Deletion Constants
 *
 * @remarks
 * Infrastructure Layer: Constants for GDPR deletion operations.
 * Separated for SRP compliance.
 *
 * Iteration 13: GDPR Right-to-Delete
 */
/**
 * Table configuration for deletion
 *
 * @remarks
 * ONE source of truth for tables subject to GDPR deletion.
 */
export declare const GDPR_TABLES: readonly ["financial_reports", "financial_reports_summary", "companies_meta", "company_sanctions"];
/**
 * Database name
 */
export declare const DEFAULT_DATABASE = "infoindexer";
/**
 * Get fully qualified table name
 *
 * @param database - Database name
 * @param table - Table name
 * @returns database.table
 */
export declare function getQualifiedTableName(database: string, table: string): string;
