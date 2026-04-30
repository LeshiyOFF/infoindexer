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
export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
})(LogLevel || (LogLevel = {}));
