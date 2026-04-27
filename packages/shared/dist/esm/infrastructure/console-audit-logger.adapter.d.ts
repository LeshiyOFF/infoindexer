/**
 * Console Audit Logger Adapter
 *
 * @remarks
 * Infrastructure Layer: Console implementation of IAuditLogger.
 * Part of Hexagonal / Ports & Adapters architecture.
 *
 * Architecture:
 * - Port (Domain Layer): IAuditLogger
 * - Adapter (Infrastructure Layer): This class
 *
 * Design Decisions:
 * - Fallback adapter for development and testing
 * - JSON structured output for parsing
 * - Non-blocking (console.log is async in Node.js)
 * - No external dependencies
 *
 * Use Cases:
 * - Development environments
 * - Testing (unit tests, integration tests)
 * - Fallback when ClickHouse is unavailable
 *
 * Iteration 12: Audit Logging
 */
import type { IAuditLogger, AuditLoggerResult, AuditLoggerOptions } from './ports/i-audit-logger.port';
import type { AuditEvent } from '../domain/audit-event.dto';
/**
 * Console Audit Logger Adapter
 *
 * @remarks
 * Writes audit events to console in structured JSON format.
 * Always healthy (console never fails).
 * Always succeeds (console.log doesn't throw).
 *
 * @example
 * ```ts
 * const logger = new ConsoleAuditLoggerAdapter({ debug: true });
 * await logger.logEvent(event);
 * ```
 */
export declare class ConsoleAuditLoggerAdapter implements IAuditLogger {
    private readonly config;
    private readonly stats;
    /**
     * Creates a new console audit logger
     *
     * @param config - Configuration options
     */
    constructor(config?: {
        /** Enable debug output */
        debug?: boolean;
        /** Add color to output */
        colors?: boolean;
    });
    /**
     * Log an audit event to console
     *
     * @remarks
     * - Always succeeds (console.log is reliable)
     * - JSON format for parsing
     * - Includes timestamp and service name
     */
    logEvent(event: AuditEvent, _options?: AuditLoggerOptions): Promise<AuditLoggerResult>;
    /**
     * Check if the audit logger is healthy
     *
     * @remarks
     * Console logger is always healthy.
     */
    isHealthy(): boolean;
    /**
     * Get statistics about logged events
     *
     * @remarks
     * Stats reset on service restart (non-persistent).
     */
    getStats(): {
        logged: number;
        failed: number;
        pending: number;
    };
    /**
     * Flush any buffered events
     *
     * @remarks
     * Console has no buffer; this is a no-op.
     */
    flush(): Promise<void>;
    /**
     * Add ANSI color codes to JSON output
     *
     * @remarks
     * Adds subtle highlighting for readability.
     */
    private addColor;
}
/**
 * Factory function for creating console audit logger
 *
 * @remarks
 * Creates a console audit logger with default options.
 *
 * @param config - Configuration options
 * @returns Console audit logger
 *
 * @example
 * ```ts
 * const logger = createConsoleAuditLogger({ debug: true });
 * ```
 */
export declare function createConsoleAuditLogger(config?: {
    debug?: boolean;
    colors?: boolean;
}): ConsoleAuditLoggerAdapter;
