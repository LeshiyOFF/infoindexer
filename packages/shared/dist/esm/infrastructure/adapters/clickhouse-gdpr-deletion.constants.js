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
export const GDPR_TABLES = [
    'financial_reports',
    'financial_reports_summary',
    'companies_meta',
    'company_sanctions'
];
/**
 * Database name
 */
export const DEFAULT_DATABASE = 'infoindexer';
/**
 * Get fully qualified table name
 *
 * @param database - Database name
 * @param table - Table name
 * @returns database.table
 */
export function getQualifiedTableName(database, table) {
    return `${database}.${table}`;
}
