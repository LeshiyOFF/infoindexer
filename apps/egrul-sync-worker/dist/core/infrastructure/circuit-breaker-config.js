"use strict";
/**
 * Circuit Breaker Configuration
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CIRCUIT_CONFIG = void 0;
/**
 * Значения по умолчанию
 */
exports.DEFAULT_CIRCUIT_CONFIG = {
    failureThreshold: 5,
    halfOpenTimeout: 60000,
    openTimeout: 30000,
    slidingWindowSize: 10000
};
