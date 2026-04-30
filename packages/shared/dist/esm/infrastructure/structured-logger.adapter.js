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
import { LogLevel } from './ports/i-logger.port';
/**
 * Default logger options
 */
const DEFAULT_OPTIONS = {
    minLevel: LogLevel.INFO,
    timestamps: true,
    colors: false
};
/**
 * ANSI color codes for console output
 */
const COLORS = {
    reset: '\x1b[0m',
    dim: '\x1b[2m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    blue: '\x1b[34m'
};
/**
 * Log level names and colors
 */
const LEVEL_CONFIG = {
    [LogLevel.DEBUG]: { name: 'DEBUG', color: COLORS.blue },
    [LogLevel.INFO]: { name: 'INFO', color: COLORS.green },
    [LogLevel.WARN]: { name: 'WARN', color: COLORS.yellow },
    [LogLevel.ERROR]: { name: 'ERROR', color: COLORS.red }
};
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
export class StructuredLoggerAdapter {
    context;
    minLevel;
    timestamps;
    colors;
    constructor(context, options = {}) {
        this.context = context;
        const opts = { ...DEFAULT_OPTIONS, ...options };
        this.minLevel = opts.minLevel;
        this.timestamps = opts.timestamps;
        this.colors = opts.colors;
    }
    info(message, context) {
        this.log(LogLevel.INFO, message, context);
    }
    warn(message, context) {
        this.log(LogLevel.WARN, message, context);
    }
    error(message, context) {
        this.log(LogLevel.ERROR, message, context);
    }
    debug(message, context) {
        this.log(LogLevel.DEBUG, message, context);
    }
    /**
     * Core logging method
     *
     * @remarks
     * Filters by level, formats output, writes to console.
     */
    log(level, message, context) {
        if (level < this.minLevel) {
            return;
        }
        const entry = this.formatEntry(level, message, context);
        const output = JSON.stringify(entry);
        const config = LEVEL_CONFIG[level];
        const stream = level >= LogLevel.ERROR ? console.error : console.log;
        if (this.colors && process.stdout.isTTY) {
            const coloredLevel = `${config.color}${config.name}${COLORS.reset}`;
            const coloredOutput = output.replace(`"level":"${config.name}"`, `"level":"${coloredLevel}"`);
            stream(coloredOutput);
        }
        else {
            stream(output);
        }
    }
    /**
     * Format log entry
     */
    formatEntry(level, message, context) {
        const entry = {
            level: LEVEL_CONFIG[level].name,
            service: this.context,
            message
        };
        if (this.timestamps) {
            entry.timestamp = new Date().toISOString();
        }
        if (context && Object.keys(context).length > 0) {
            entry.context = this.serializeContext(context);
        }
        return entry;
    }
    /**
     * Serialize context with error handling
     */
    serializeContext(context) {
        const serialized = {};
        for (const [key, value] of Object.entries(context)) {
            if (value instanceof Error) {
                serialized[key] = {
                    name: value.name,
                    message: value.message,
                    stack: value.stack
                };
            }
            else {
                serialized[key] = value;
            }
        }
        return serialized;
    }
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
export function createLogger(context, options) {
    return new StructuredLoggerAdapter(context, options);
}
