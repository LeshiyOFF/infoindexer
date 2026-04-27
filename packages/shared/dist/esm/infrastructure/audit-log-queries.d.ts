/**
 * Audit Log Query SQL
 *
 * @remarks
 * Infrastructure Layer: Query templates for audit log retrieval.
 * Separated from DDL for SRP compliance.
 *
 * Iteration 12: Audit Logging
 */
/**
 * Query audit events by user
 *
 * @remarks
 * Fetches all audit events for a specific user within a time range.
 */
export declare function createAuditLogSelectByUser(database: string, tableName?: string): string;
/**
 * Query audit events by resource
 *
 * @remarks
 * Fetches all audit events for a specific resource.
 */
export declare function createAuditLogSelectByResource(database: string, tableName?: string): string;
/**
 * Query audit events by type
 *
 * @remarks
 * Fetches audit events filtered by event type.
 */
export declare function createAuditLogSelectByType(database: string, tableName?: string): string;
/**
 * Count audit events by user
 *
 * @remarks
 * Returns count of audit events for a user within time range.
 */
export declare function createAuditLogCountByUser(database: string, tableName?: string): string;
/**
 * Get audit statistics
 *
 * @remarks
 * Aggregates audit events by type for reporting.
 */
export declare function createAuditLogStats(database: string, tableName?: string): string;
