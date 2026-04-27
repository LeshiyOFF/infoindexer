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
import type { IAuditLogger, AuditLoggerResult, AuditLoggerOptions } from './ports/i-audit-logger.port';
import type { AuditEvent } from '../domain/audit-event.dto';
import type { ClickHouseClient } from '@clickhouse/client';
/**
 * ClickHouse Audit Logger Adapter
 *
 * @remarks
 * Writes audit events to ClickHouse audit_log table.
 * Falls back to console logging on failure.
 */
export declare class ClickHouseAuditLoggerAdapter implements IAuditLogger {
    private readonly client;
    private readonly tableName;
    private readonly database;
    private readonly options;
    private readonly stats;
    private healthy;
    constructor(client: ClickHouseClient, config?: {
        database?: string;
        tableName?: string;
        options?: AuditLoggerOptions;
    });
    logEvent(event: AuditEvent, options?: AuditLoggerOptions): Promise<AuditLoggerResult>;
    isHealthy(): boolean;
    getStats(): {
        logged: number;
        failed: number;
        pending: number;
    };
    flush(): Promise<void>;
    initialize(): Promise<void>;
}
