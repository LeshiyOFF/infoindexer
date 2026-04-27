"use strict";
/**
 * ClickHouse GDPR Deletion Constants
 *
 * @remarks
 * Infrastructure Layer: Constants for GDPR deletion operations.
 * Separated for SRP compliance.
 *
 * Iteration 13: GDPR Right-to-Delete
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_DATABASE = exports.GDPR_TABLES = void 0;
exports.getQualifiedTableName = getQualifiedTableName;
/**
 * Table configuration for deletion
 *
 * @remarks
 * ONE source of truth for tables subject to GDPR deletion.
 */
exports.GDPR_TABLES = [
    'financial_reports',
    'financial_reports_summary',
    'companies_meta',
    'company_sanctions'
];
/**
 * Database name
 */
exports.DEFAULT_DATABASE = 'infoindexer';
/**
 * Get fully qualified table name
 *
 * @param database - Database name
 * @param table - Table name
 * @returns database.table
 */
function getQualifiedTableName(database, table) {
    return `${database}.${table}`;
}
