/**
 * Predefined Retry Strategies
 */

import { RetryPolicy } from './retry';
import type { RetryConfig } from './retry-config';

/**
 * Предопределённые стратегии retry
 */
export const RetryStrategies = {
  /** Быстрый retry для временных сетевых сбоев */
  fast: new RetryPolicy({
    maxAttempts: 3,
    baseDelay: 100,
    maxDelay: 1000,
    strategy: 'exponential',
    multiplier: 2,
    jitter: 0.1
  }),

  /** Стандартный retry для API calls */
  standard: new RetryPolicy({
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    strategy: 'exponential',
    multiplier: 2,
    jitter: 0.15
  }),

  /** Медленный retry для внешних сервисов */
  slow: new RetryPolicy({
    maxAttempts: 5,
    baseDelay: 2000,
    maxDelay: 30000,
    strategy: 'exponential',
    multiplier: 2,
    jitter: 0.2
  }),

  /** Линейный retry */
  linear: new RetryPolicy({
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 5000,
    strategy: 'linear',
    multiplier: 1,
    jitter: 0.1
  })
} as const;

/** Тип предопределённой стратегии */
export type RetryStrategyName = keyof typeof RetryStrategies;

/**
 * Получает стратегию по имени
 */
export function getStrategy(name: RetryStrategyName): RetryPolicy {
  return RetryStrategies[name];
}
