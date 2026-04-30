/**
 * Console Logger Adapter
 *
 * @remarks
 * Console implementation of ILogger port.
 * Suitable for development and logging to stdout/stderr.
 *
 * @pattern Adapter Pattern
 * @pattern Hexagonal / Ports & Adapters
 */
import type { ILogger } from '../../domain/ports/i-logger.port';
import { LogLevel } from '../../domain/ports/i-logger.port';
/**
 * Console Logger Adapter
 *
 * @remarks
 * Simple console-based logger implementation.
 * Formats messages with timestamp and context.
 */
export declare class ConsoleLoggerAdapter implements ILogger {
    private readonly context;
    private readonly minLevel;
    constructor(context?: Record<string, unknown>, minLevel?: LogLevel);
    debug(message: string, context?: Record<string, unknown>): void;
    info(message: string, context?: Record<string, unknown>): void;
    warn(message: string, context?: Record<string, unknown>): void;
    error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void;
    withContext(additionalContext: Record<string, unknown>): ILogger;
    private shouldLog;
    private format;
}
