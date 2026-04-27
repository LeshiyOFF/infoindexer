/**
 * Structured Logger Adapter
 *
 * @remarks
 * Infrastructure Layer: Console-based implementation of ILogger.
 * Part of Hexagonal / Ports & Adapters architecture.
 *
 * Architecture:
 * - Port (Domain Layer): ILogger
 * - Adapter (Infrastructure Layer): This class
 *
 * Features:
 * - ISO 8601 timestamps
 * - Structured JSON output for machine parsing
 * - Context-aware logging
 * - Log level filtering
 *
 * Iteration 10: RBAC + Config Validation
 */
import type { ILogger, LogContext, LoggerOptions } from './ports/i-logger.port';
/**
 * Structured Logger Implementation
 *
 * @remarks
 * Thread-safe console logger with structured output.
 * Context is serialized as JSON for parsing.
 *
 * @example
 * ```ts
 * const logger = new StructuredLoggerAdapter('my-service');
 * logger.info('User logged in', { userId: '123', ip: '10.0.0.1' });
 * // Output: {"timestamp":"2026-04-21T10:00:00.000Z","level":"INFO","service":"my-service","message":"User logged in","context":{"userId":"123","ip":"10.0.0.1"}}
 * ```
 */
export declare class StructuredLoggerAdapter implements ILogger {
    private readonly context;
    private readonly minLevel;
    private readonly timestamps;
    private readonly colors;
    constructor(context: string, options?: LoggerOptions);
    info(message: string, context?: LogContext): void;
    warn(message: string, context?: LogContext): void;
    error(message: string, context?: LogContext): void;
    debug(message: string, context?: LogContext): void;
    /**
     * Core logging method
     *
     * @remarks
     * Filters by level, formats output, writes to console.
     */
    private log;
    /**
     * Format log entry
     */
    private formatEntry;
    /**
     * Serialize context with error handling
     */
    private serializeContext;
}
/**
 * Logger factory
 *
 * @remarks
 * Creates logger instances with consistent configuration.
 *
 * @param context - Service/component name for log identification
 * @param options - Logger configuration options
 * @returns Configured logger instance
 *
 * @example
 * ```ts
 * const logger = createLogger('sync-worker');
 * logger.info('Starting sync');
 * ```
 */
export declare function createLogger(context: string, options?: LoggerOptions): ILogger;
