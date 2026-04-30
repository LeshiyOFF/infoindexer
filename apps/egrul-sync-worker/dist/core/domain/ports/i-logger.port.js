"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogLevel = void 0;
/**
 * Log level severity
 */
var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "debug";
    LogLevel["INFO"] = "info";
    LogLevel["WARN"] = "warn";
    LogLevel["ERROR"] = "error";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
