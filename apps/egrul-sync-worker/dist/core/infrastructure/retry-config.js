"use strict";
/**
 * Retry Configuration
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_RETRY_CONFIG = void 0;
/**
 * Значения по умолчанию
 */
exports.DEFAULT_RETRY_CONFIG = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    strategy: 'exponential',
    multiplier: 2,
    jitter: 0.1
};
