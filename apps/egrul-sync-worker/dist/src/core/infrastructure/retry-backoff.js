"use strict";
/**
 * Backoff Calculator
 *
 * Вычисляет задержку между попытками retry.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackoffCalculator = void 0;
/**
 * Калькулятор задержки с backoff
 */
class BackoffCalculator {
    config;
    random;
    constructor(config, random) {
        this.config = config;
        this.random = random;
    }
    /** Вычисляет задержку с учётом стратегии и jitter */
    calculate(attempt) {
        const baseDelay = this.getBaseDelay(attempt);
        const withJitter = this.applyJitter(baseDelay);
        return Math.min(Math.max(withJitter, 0), this.config.maxDelay);
    }
    /** Базовая задержка по стратегии */
    getBaseDelay(attempt) {
        switch (this.config.strategy) {
            case 'exponential':
                return this.config.baseDelay * Math.pow(this.config.multiplier, attempt - 1);
            case 'linear':
                return this.config.baseDelay * attempt;
            case 'constant':
                return this.config.baseDelay;
        }
    }
    /** Применяет jitter для разброса */
    applyJitter(delay) {
        if (this.config.jitter <= 0)
            return delay;
        const jitterAmount = delay * this.config.jitter;
        const randomJitter = (this.random() - 0.5) * 2 * jitterAmount;
        return delay + randomJitter;
    }
}
exports.BackoffCalculator = BackoffCalculator;
