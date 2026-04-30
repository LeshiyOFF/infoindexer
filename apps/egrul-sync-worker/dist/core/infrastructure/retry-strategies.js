"use strict";
/**
 * Predefined Retry Strategies
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryStrategies = void 0;
exports.getStrategy = getStrategy;
const retry_1 = require("./retry");
/**
 * Предопределённые стратегии retry
 */
exports.RetryStrategies = {
    /** Быстрый retry для временных сетевых сбоев */
    fast: new retry_1.RetryPolicy({
        maxAttempts: 3,
        baseDelay: 100,
        maxDelay: 1000,
        strategy: 'exponential',
        multiplier: 2,
        jitter: 0.1
    }),
    /** Стандартный retry для API calls */
    standard: new retry_1.RetryPolicy({
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 10000,
        strategy: 'exponential',
        multiplier: 2,
        jitter: 0.15
    }),
    /** Медленный retry для внешних сервисов */
    slow: new retry_1.RetryPolicy({
        maxAttempts: 5,
        baseDelay: 2000,
        maxDelay: 30000,
        strategy: 'exponential',
        multiplier: 2,
        jitter: 0.2
    }),
    /** Линейный retry */
    linear: new retry_1.RetryPolicy({
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 5000,
        strategy: 'linear',
        multiplier: 1,
        jitter: 0.1
    })
};
/**
 * Получает стратегию по имени
 */
function getStrategy(name) {
    return exports.RetryStrategies[name];
}
