"use strict";
/**
 * Retry Policy
 *
 * Политика повторных попыток с экспоненциальным backoff.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryPolicy = void 0;
const retry_config_1 = require("./retry-config");
const retry_backoff_1 = require("./retry-backoff");
/**
 * Retry Policy с экспоненциальным backoff
 */
class RetryPolicy {
    config;
    random;
    constructor(config = retry_config_1.DEFAULT_RETRY_CONFIG, random = Math.random) {
        this.config = config;
        this.random = random;
    }
    /** Выполняет функцию с retry логикой */
    async execute(fn) {
        let lastError = null;
        for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
            try {
                const value = await fn(this.createContext(attempt, lastError ?? undefined));
                return { success: true, value, attempts: attempt };
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                if (this.shouldStopAttempt(attempt, lastError)) {
                    break;
                }
                await this.sleep(this.calculateDelay(attempt));
            }
        }
        return {
            success: false,
            error: lastError ?? new Error('Retry failed without error'),
            attempts: this.config.maxAttempts
        };
    }
    /** Создаёт контекст попытки */
    createContext(attempt, lastError) {
        return {
            attempt,
            totalAttempts: this.config.maxAttempts,
            delay: 0,
            lastError
        };
    }
    /** Проверяет нужно ли остановить попытки */
    shouldStopAttempt(attempt, error) {
        if (attempt >= this.config.maxAttempts)
            return true;
        if (this.config.shouldRetry && !this.config.shouldRetry(error))
            return true;
        return false;
    }
    /** Вычисляет задержку */
    calculateDelay(attempt) {
        return new retry_backoff_1.BackoffCalculator(this.config, this.random).calculate(attempt);
    }
    /** Задержка выполнения */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /** Новая политика с изменённой конфигурацией */
    withConfig(partialConfig) {
        return new RetryPolicy({ ...this.config, ...partialConfig }, this.random);
    }
}
exports.RetryPolicy = RetryPolicy;
__exportStar(require("./retry-types"), exports);
__exportStar(require("./retry-config"), exports);
__exportStar(require("./retry-strategies"), exports);
