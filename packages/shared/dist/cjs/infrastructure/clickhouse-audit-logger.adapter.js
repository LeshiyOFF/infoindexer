"use strict";
/**
 * ClickHouse Audit Logger Adapter
 *
 * @remarks
 * Infrastructure Layer: ClickHouse implementation of IAuditLogger.
 * Part of Hexagonal / Ports & Adapters architecture.
 *
 * Architecture:
 * - Port (Domain Layer): IAuditLogger
 * - Adapter (Infrastructure Layer): This class
 *
 * Design Decisions:
 * - Async non-blocking writes
 * - Best-effort delivery (logs to console on failure)
 * - Connection health checking
 * - Statistics tracking for monitoring
 *
 * Error Handling:
 * - Recoverable errors (timeout, connection): log to console, return success: false
 * - Unrecoverable errors (invalid event): throw Error
 *
 * Iteration 12: Audit Logging
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickHouseAuditLoggerAdapter = void 0;
const audit_log_sql_1 = require("./audit-log-sql");
const audit_logger_helpers_1 = require("./audit-logger.helpers");
/** Default options for ClickHouse audit logger */
const DEFAULT_OPTIONS = {
    sync: false,
    batchSize: 1,
    timeout: 5000
};
/**
 * ClickHouse Audit Logger Adapter
 *
 * @remarks
 * Writes audit events to ClickHouse audit_log table.
 * Falls back to console logging on failure.
 */
class ClickHouseAuditLoggerAdapter {
    client;
    tableName;
    database;
    options;
    stats = { logged: 0, failed: 0, pending: 0 };
    healthy = true;
    constructor(client, config = {}) {
        this.client = client;
        this.database = config.database || 'infoindexer';
        this.tableName = config.tableName || audit_log_sql_1.AUDIT_LOG_DEFAULTS.tableName;
        this.options = { ...DEFAULT_OPTIONS, ...config.options };
        (0, audit_logger_helpers_1.validateAuditLoggerConfig)(this.database, this.tableName);
    }
    async logEvent(event, options) {
        const opts = { ...this.options, ...options };
        try {
            const eventObj = event.toObject();
            const metadataJson = JSON.stringify(eventObj.metadata);
            await this.client.insert({
                table: `${this.database}.${this.tableName}`,
                format: 'JSONEachRow',
                values: [{
                        event_type: eventObj.eventType,
                        action_type: eventObj.actionType,
                        user_id: eventObj.userId,
                        resource_type: eventObj.resourceType,
                        resource_id: eventObj.resourceId,
                        metadata: metadataJson,
                        client_ip: eventObj.metadata?.ip || null,
                        user_agent: eventObj.metadata?.userAgent || null
                    }],
                clickhouse_settings: opts.sync
                    ? { wait_for_async_insert: 1 }
                    : { async_insert: 1, wait_for_async_insert: 0 }
            });
            this.stats.logged++;
            this.stats.pending--;
            return { success: true, id: (0, audit_logger_helpers_1.generateLogId)() };
        }
        catch (error) {
            this.stats.failed++;
            this.healthy = (0, audit_logger_helpers_1.isRecoverableError)(error);
            (0, audit_logger_helpers_1.logToConsole)(event, error);
            return { success: false, error: (0, audit_logger_helpers_1.extractErrorMessage)(error) };
        }
    }
    isHealthy() {
        return this.healthy;
    }
    getStats() {
        return { ...this.stats };
    }
    async flush() {
        // ClickHouse async_insert handles buffering
    }
    async initialize() {
        try {
            await this.client.command({
                query: (0, audit_log_sql_1.createAuditLogDDL)(this.database, this.tableName)
            });
        }
        catch (error) {
            const msg = (0, audit_logger_helpers_1.extractErrorMessage)(error);
            if (!msg.includes('already exists')) {
                throw error;
            }
        }
    }
}
exports.ClickHouseAuditLoggerAdapter = ClickHouseAuditLoggerAdapter;
