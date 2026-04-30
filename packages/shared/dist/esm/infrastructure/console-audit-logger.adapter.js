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
export class ConsoleAuditLoggerAdapter {
    config;
    stats = {
        logged: 0,
        failed: 0,
        pending: 0
    };
    /**
     * Creates a new console audit logger
     *
     * @param config - Configuration options
     */
    constructor(config = {}) {
        this.config = config;
    }
    /**
     * Log an audit event to console
     *
     * @remarks
     * - Always succeeds (console.log is reliable)
     * - JSON format for parsing
     * - Includes timestamp and service name
     */
    async logEvent(event, _options) {
        const eventObj = event.toObject();
        const output = {
            level: 'INFO',
            service: 'audit-logger',
            timestamp: new Date().toISOString(),
            message: 'Audit event',
            event: eventObj
        };
        const jsonOutput = JSON.stringify(output, null, this.config.debug ? 2 : 0);
        if (this.config.colors && process.stdout.isTTY) {
            const colored = this.addColor(jsonOutput);
            console.log(colored);
        }
        else {
            console.log(jsonOutput);
        }
        this.stats.logged++;
        return {
            success: true,
            id: `console-${Date.now()}`
        };
    }
    /**
     * Check if the audit logger is healthy
     *
     * @remarks
     * Console logger is always healthy.
     */
    isHealthy() {
        return true;
    }
    /**
     * Get statistics about logged events
     *
     * @remarks
     * Stats reset on service restart (non-persistent).
     */
    getStats() {
        return { ...this.stats };
    }
    /**
     * Flush any buffered events
     *
     * @remarks
     * Console has no buffer; this is a no-op.
     */
    async flush() {
        // No-op for console
    }
    /**
     * Add ANSI color codes to JSON output
     *
     * @remarks
     * Adds subtle highlighting for readability.
     */
    addColor(json) {
        const colors = {
            reset: '\x1b[0m',
            dim: '\x1b[2m',
            cyan: '\x1b[36m',
            green: '\x1b[32m'
        };
        return (colors.dim +
            json.replace(/"level": "(\w+)"/, `${colors.reset}"level": ${colors.cyan}"$1"${colors.dim}`).replace(/"service": "(\w+)"/, `${colors.reset}"service": ${colors.green}"$1"${colors.dim}`) +
            colors.reset);
    }
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
export function createConsoleAuditLogger(config) {
    return new ConsoleAuditLoggerAdapter(config);
}
