/**
 * Port: ILogger
 *
 * @remarks
 * Interface for logging operations.
 * Follows Interface Segregation: focused, single-purpose interface.
 * Follows Dependency Inversion: high-level modules depend on this abstraction.
 *
 * @pattern Hexagonal / Ports & Adapters
 * @pattern Dependency Inversion Principle
 * @pattern Interface Segregation Principle
 */

/**
 * Log level severity
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

/**
 * Logger Port
 *
 * @remarks
 * Defines contract for logging operations.
 * Supports structured logging via context parameter.
 */
export interface ILogger {
  /**
   * Log debug message
   *
   * @param message - Log message
   * @param context - Optional structured context
   */
  debug(message: string, context?: Record<string, unknown>): void;

  /**
   * Log info message
   *
   * @param message - Log message
   * @param context - Optional structured context
   */
  info(message: string, context?: Record<string, unknown>): void;

  /**
   * Log warning message
   *
   * @param message - Log message
   * @param context - Optional structured context
   */
  warn(message: string, context?: Record<string, unknown>): void;

  /**
   * Log error message
   *
   * @param message - Log message
   * @param error - Optional error object
   * @param context - Optional structured context
   */
  error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void;

  /**
   * Create child logger with additional context
   *
   * @param context - Additional context to include in all log messages
   * @returns New logger instance with merged context
   */
  withContext(context: Record<string, unknown>): ILogger;
}
