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
export class ConsoleLoggerAdapter implements ILogger {
  constructor(
    private readonly context: Record<string, unknown> = {},
    private readonly minLevel: LogLevel = LogLevel.INFO
  ) {}

  debug(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.format(LogLevel.DEBUG, message, context));
    }
  }

  info(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.format(LogLevel.INFO, message, context));
    }
  }

  warn(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.format(LogLevel.WARN, message, context));
    }
  }

  error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const errorContext = error instanceof Error
        ? { ...context, error: error.message, stack: error.stack }
        : { ...context, error };
      console.error(this.format(LogLevel.ERROR, message, errorContext));
    }
  }

  withContext(additionalContext: Record<string, unknown>): ILogger {
    return new ConsoleLoggerAdapter(
      { ...this.context, ...additionalContext },
      this.minLevel
    );
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    return levels.indexOf(level) >= levels.indexOf(this.minLevel);
  }

  private format(level: LogLevel, message: string, context?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    const allContext = { ...this.context, ...context };
    const ctxStr = Object.keys(allContext).length > 0
      ? ` ${JSON.stringify(allContext)}`
      : '';
    const levelStr = level.toUpperCase();
    return `${timestamp} [${levelStr}] ${message}${ctxStr}`;
  }
}
