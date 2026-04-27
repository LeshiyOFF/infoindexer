/**
 * Audit Logger Helper Functions
 *
 * @remarks
 * Infrastructure Layer: Helper functions for audit logging.
 * Separated from adapters for SRP compliance.
 *
 * Iteration 12: Audit Logging
 */
/**
 * Extract error message from unknown error type
 *
 * @param error - Unknown error object
 * @returns String error message
 */
export declare function extractErrorMessage(error: unknown): string;
/**
 * Check if an error is recoverable
 *
 * @remarks
 * Recoverable errors: timeout, connection issues, temporary failures
 * Unrecoverable errors: authentication, permission, schema issues
 *
 * @param error - Unknown error object
 * @returns true if error is recoverable
 */
export declare function isRecoverableError(error: unknown): boolean;
/**
 * Fallback logging to console
 *
 * @remarks
 * Used when ClickHouse write fails.
 *
 * @param event - The audit event that failed
 * @param error - The error that occurred
 */
export declare function logToConsole(event: {
    toObject(): Record<string, unknown>;
}, error: unknown): void;
/**
 * Validate configuration
 *
 * @throws {Error} If configuration is invalid
 */
export declare function validateAuditLoggerConfig(database: string, tableName: string): void;
/**
 * Validate database name
 */
export declare function validateDatabaseName(name: string): boolean;
/**
 * Validate table name
 */
export declare function validateTableName(name: string): boolean;
/**
 * Generate unique log entry ID
 */
export declare function generateLogId(): string;
