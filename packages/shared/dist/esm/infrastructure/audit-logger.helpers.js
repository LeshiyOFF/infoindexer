"use strict";
/**
 * Audit Logger Helper Functions
 *
 * @remarks
 * Infrastructure Layer: Helper functions for audit logging.
 * Separated from adapters for SRP compliance.
 *
 * Iteration 12: Audit Logging
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractErrorMessage = extractErrorMessage;
exports.isRecoverableError = isRecoverableError;
exports.logToConsole = logToConsole;
exports.validateAuditLoggerConfig = validateAuditLoggerConfig;
exports.validateDatabaseName = validateDatabaseName;
exports.validateTableName = validateTableName;
exports.generateLogId = generateLogId;
/**
 * Extract error message from unknown error type
 *
 * @param error - Unknown error object
 * @returns String error message
 */
function extractErrorMessage(error) {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    return 'Unknown error';
}
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
function isRecoverableError(error) {
    const msg = extractErrorMessage(error).toLowerCase();
    const unrecoverablePatterns = [
        'authentication',
        'permission denied',
        'access denied',
        'unknown table',
        'database does not exist',
        'syntax error'
    ];
    return !unrecoverablePatterns.some(pattern => msg.includes(pattern));
}
/**
 * Fallback logging to console
 *
 * @remarks
 * Used when ClickHouse write fails.
 *
 * @param event - The audit event that failed
 * @param error - The error that occurred
 */
function logToConsole(event, error) {
    const eventObj = event.toObject();
    const errorMsg = extractErrorMessage(error);
    console.error(JSON.stringify({
        level: 'ERROR',
        service: 'audit-logger',
        message: 'Failed to write audit event to ClickHouse',
        error: errorMsg,
        event: eventObj
    }));
}
/**
 * Validate configuration
 *
 * @throws {Error} If configuration is invalid
 */
function validateAuditLoggerConfig(database, tableName) {
    if (!validateDatabaseName(database)) {
        throw new Error(`Invalid database name: ${database}`);
    }
    if (!validateTableName(tableName)) {
        throw new Error(`Invalid table name: ${tableName}`);
    }
}
/**
 * Validate database name
 */
function validateDatabaseName(name) {
    return /^[a-z_][a-z0-9_]{0,60}$/.test(name);
}
/**
 * Validate table name
 */
function validateTableName(name) {
    return /^[a-z_][a-z0-9_]{0,60}$/.test(name);
}
/**
 * Generate unique log entry ID
 */
function generateLogId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
