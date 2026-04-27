/**
 * Audit Log SQL DDL
 *
 * @remarks
 * Infrastructure Layer: DDL statements for audit logging tables.
 * Part of Hexagonal / Ports & Adapters architecture.
 *
 * Iteration 12: Audit Logging
 */
/**
 * Audit log table DDL
 *
 * @remarks
 * Creates the audit_log table in the specified database.
 * Uses MergeTree for performance with partitioning and TTL.
 */
export declare function createAuditLogDDL(database: string, tableName?: string): string;
/**
 * Default options for audit log
 */
export declare const AUDIT_LOG_DEFAULTS: {
    readonly tableName: "audit_log";
    readonly defaultLimit: 1000;
    readonly maxLimit: 10000;
    readonly defaultTtlDays: 90;
};
/**
 * Validate table name
 *
 * @remarks
 * Prevents SQL injection in table name.
 */
export declare function validateTableName(name: string): boolean;
/**
 * Validate database name
 *
 * @remarks
 * Prevents SQL injection in database name.
 */
export declare function validateDatabaseName(name: string): boolean;
