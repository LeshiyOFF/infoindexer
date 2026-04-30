"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleLoggerAdapter = void 0;
const i_logger_port_1 = require("../../domain/ports/i-logger.port");
/**
 * Console Logger Adapter
 *
 * @remarks
 * Simple console-based logger implementation.
 * Formats messages with timestamp and context.
 */
class ConsoleLoggerAdapter {
    context;
    minLevel;
    constructor(context = {}, minLevel = i_logger_port_1.LogLevel.INFO) {
        this.context = context;
        this.minLevel = minLevel;
    }
    debug(message, context) {
        if (this.shouldLog(i_logger_port_1.LogLevel.DEBUG)) {
            console.log(this.format(i_logger_port_1.LogLevel.DEBUG, message, context));
        }
    }
    info(message, context) {
        if (this.shouldLog(i_logger_port_1.LogLevel.INFO)) {
            console.info(this.format(i_logger_port_1.LogLevel.INFO, message, context));
        }
    }
    warn(message, context) {
        if (this.shouldLog(i_logger_port_1.LogLevel.WARN)) {
            console.warn(this.format(i_logger_port_1.LogLevel.WARN, message, context));
        }
    }
    error(message, error, context) {
        if (this.shouldLog(i_logger_port_1.LogLevel.ERROR)) {
            const errorContext = error instanceof Error
                ? { ...context, error: error.message, stack: error.stack }
                : { ...context, error };
            console.error(this.format(i_logger_port_1.LogLevel.ERROR, message, errorContext));
        }
    }
    withContext(additionalContext) {
        return new ConsoleLoggerAdapter({ ...this.context, ...additionalContext }, this.minLevel);
    }
    shouldLog(level) {
        const levels = [i_logger_port_1.LogLevel.DEBUG, i_logger_port_1.LogLevel.INFO, i_logger_port_1.LogLevel.WARN, i_logger_port_1.LogLevel.ERROR];
        return levels.indexOf(level) >= levels.indexOf(this.minLevel);
    }
    format(level, message, context) {
        const timestamp = new Date().toISOString();
        const allContext = { ...this.context, ...context };
        const ctxStr = Object.keys(allContext).length > 0
            ? ` ${JSON.stringify(allContext)}`
            : '';
        const levelStr = level.toUpperCase();
        return `${timestamp} [${levelStr}] ${message}${ctxStr}`;
    }
}
exports.ConsoleLoggerAdapter = ConsoleLoggerAdapter;
