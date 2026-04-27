/**
 * Audit Logger Port
 *
 * @remarks
 * Domain Layer: Defines the contract for audit logging.
 * Part of Hexagonal / Ports & Adapters architecture.
 *
 * Architecture:
 * - Port (Domain Layer): This interface
 * - Adapter (Infrastructure Layer): ClickHouseAuditLoggerAdapter, ConsoleAuditLoggerAdapter
 *
 * Design Decision: Minimal interface
 * - Single method: logEvent() for all audit operations
 * - Async: supports remote storage (ClickHouse, S3, etc.)
 * - Error handling: throws for unrecoverable errors, logs for recoverable
 *
 * Implementations:
 * - ClickHouseAuditLoggerAdapter: Writes to audit_log table (Iteration 12)
 * - ConsoleAuditLoggerAdapter: Console output for development (Iteration 12)
 * - S3AuditLoggerAdapter: Writes to S3 for long-term storage (future)
 * - ElasticsearchAuditLoggerAdapter: Writes to Elasticsearch for search (future)
 *
 * Iteration 12: Audit Logging
 */
import type { AuditEvent } from '../../domain/audit-event.dto';
/**
 * Audit Logger Result
 *
 * @remarks
 * Returned by logEvent() to indicate success or failure.
 */
export interface AuditLoggerResult {
    /** True if event was logged successfully */
    readonly success: boolean;
    /** Error message if success is false */
    readonly error?: string;
    /** Storage identifier (e.g., ClickHouse insert ID) */
    readonly id?: string;
}
/**
 * Audit Logger Options
 *
 * @remarks
 * Optional configuration for audit logging behavior.
 */
export interface AuditLoggerOptions {
    /**
     * Enable synchronous writes (blocks until confirmed)
     *
     * @default false
     */
    readonly sync?: boolean;
    /**
     * Batch size for bulk operations (not yet implemented)
     *
     * @default 1
     */
    readonly batchSize?: number;
    /**
     * Timeout in milliseconds for write operations
     *
     * @default 5000
     */
    readonly timeout?: number;
}
/**
 * Audit Logger Interface
 *
 * @remarks
 * Abstracts audit logging implementation from business logic.
 * High-level modules depend on this abstraction (DIP).
 *
 * Guarantees:
 * - All events are eventually persisted (best-effort)
 * - Errors are logged but don't crash the application
 * - Thread-safe (Node.js single-threaded)
 * - Context-aware (includes userId, resourceType, etc.)
 *
 * @example
 * ```ts
 * const event = new AuditEvent({
 *   eventType: AuditEventType.DATA_DELETION,
 *   actionType: AuditActionType.DELETE,
 *   userId: 'user-123',
 *   resourceType: 'financial_reports',
 *   resourceId: 'inn-1234567890',
 *   metadata: { reason: 'GDPR request' }
 * });
 *
 * await auditLogger.logEvent(event);
 * ```
 */
export interface IAuditLogger {
    /**
     * Log an audit event
     *
     * @param event - The audit event to log
     * @param options - Optional configuration for this log operation
     * @returns Result indicating success or failure
     *
     * @throws {Error} Only for unrecoverable system errors
     *
     * @remarks
     * - Errors are logged but don't throw (unless system-level)
     * - Async: may queue events for batch writing
     * - Idempotent: calling multiple times with same event is safe
     *
     * Error Handling:
     * - Recoverable errors (e.g., timeout): log to console, return success: false
     * - Unrecoverable errors (e.g., invalid event): throw Error
     */
    logEvent(event: AuditEvent, options?: AuditLoggerOptions): Promise<AuditLoggerResult>;
    /**
     * Check if audit logger is healthy
     *
     * @returns true if logger can accept events
     *
     * @remarks
     * Used for health checks and circuit breakers.
     * Should return false if storage is unavailable.
     */
    isHealthy(): boolean;
    /**
     * Get statistics about logged events
     *
     * @returns Counters for logged, failed, and pending events
     *
     * @remarks
     * Used for monitoring and observability.
     * Resets on service restart (non-persistent).
     */
    getStats(): Readonly<{
        logged: number;
        failed: number;
        pending: number;
    }>;
    /**
     * Flush any buffered events
     *
     * @remarks
     * Ensures all pending events are written to storage.
     * Called on graceful shutdown.
     */
    flush?(): Promise<void>;
}
