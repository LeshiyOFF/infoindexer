/**
 * Backoff Calculator
 *
 * Вычисляет задержку между попытками retry.
 */

import type { RetryConfig, BackoffStrategy } from './retry-config';

/**
 * Калькулятор задержки с backoff
 */
export class BackoffCalculator {
  constructor(
    private readonly config: RetryConfig,
    private readonly random: () => number
  ) {}

  /** Вычисляет задержку с учётом стратегии и jitter */
  calculate(attempt: number): number {
    const baseDelay = this.getBaseDelay(attempt);
    const withJitter = this.applyJitter(baseDelay);
    return Math.min(Math.max(withJitter, 0), this.config.maxDelay);
  }

  /** Базовая задержка по стратегии */
  private getBaseDelay(attempt: number): number {
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
  private applyJitter(delay: number): number {
    if (this.config.jitter <= 0) return delay;
    const jitterAmount = delay * this.config.jitter;
    const randomJitter = (this.random() - 0.5) * 2 * jitterAmount;
    return delay + randomJitter;
  }
}
