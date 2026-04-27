/**
 * Logger Port
 *
 * @remarks
 * Domain Layer: Defines the contract for structured logging.
 * Part of Hexagonal / Ports & Adapters architecture.
 *
 * Architecture:
 * - Port (Domain Layer): This interface
 * - Adapter (Infrastructure Layer): StructuredLoggerAdapter, WinstonAdapter (future)
 *
 * Design Decision: Minimal interface
 * - Only essential log levels (info, error, warn, debug)
 * - Context-based logging for microservices
 * - Thread-safe (Node.js single-threaded)
 *
 * Iteration 10: RBAC + Config Validation
 */

/**
 * Log level enumeration
 *
 * @remarks
 * Ordered by severity. Lower values = less severe.
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

/**
 * Log entry context
 *
 * @remarks
 * Structured data for log aggregation and analysis.
 * All fields are optional to keep interface flexible.
 */
export interface LogContext {
  /** Error object for error level logs */
  readonly error?: unknown;

  /** Additional key-value pairs */
  readonly [key: string]: unknown;
}

/**
 * Logger Interface
 *
 * @remarks
 * Abstracts logging implementation from business logic.
 * High-level modules depend on this abstraction (DIP).
 *
 * Implementations:
 * - StructuredLoggerAdapter: console-based with timestamps (Iteration 10)
 * - WinstonAdapter: Winston-based with transports (future)
 * - PinoAdapter: Pino-based for high-performance (future)
 */
export interface ILogger {
  /**
   * Log informational message
   *
   * @param message - Human-readable message
   * @param context - Optional structured data
   */
  info(message: string, context?: LogContext): void;

  /**
   * Log warning message
   *
   * @param message - Human-readable message
   * @param context - Optional structured data
   */
  warn(message: string, context?: LogContext): void;

  /**
   * Log error message
   *
   * @param message - Human-readable message
   * @param context - Optional structured data (include error object)
   */
  error(message: string, context?: LogContext): void;

  /**
   * Log debug message
   *
   * @remarks
   * Only enabled in non-production environments.
   *
   * @param message - Human-readable message
   * @param context - Optional structured data
   */
  debug(message: string, context?: LogContext): void;
}

/**
 * Logger factory options
 *
 * @remarks
 * Configuration for logger creation.
 */
export interface LoggerOptions {
  /** Minimum log level to output (default: INFO) */
  readonly minLevel?: LogLevel;

  /** Enable timestamps (default: true) */
  readonly timestamps?: boolean;

  /** Enable colors in console (default: false for production) */
  readonly colors?: boolean;
}
