"use strict";
/**
 * ClickHouse Audit Logger Factory
 *
 * @remarks
 * Infrastructure Layer: Factory for creating ClickHouse audit logger.
 * Separated from adapter for SRP compliance.
 *
 * Iteration 12: Audit Logging
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClickHouseAuditLogger = createClickHouseAuditLogger;
const clickhouse_audit_logger_adapter_1 = require("./clickhouse-audit-logger.adapter");
/**
 * Factory function for creating ClickHouse audit logger
 *
 * @remarks
 * Creates and initializes the audit logger.
 *
 * @param client - ClickHouse client instance
 * @param config - Configuration options
 * @returns Initialized audit logger
 *
 * @example
 * ```ts
 * const logger = await createClickHouseAuditLogger(clickhouseClient, {
 *   database: 'infoindexer'
 * });
 * ```
 */
async function createClickHouseAuditLogger(client, config) {
    const logger = new clickhouse_audit_logger_adapter_1.ClickHouseAuditLoggerAdapter(client, config);
    await logger.initialize();
    return logger;
}
