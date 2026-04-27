/**
 * Circuit Breaker Configuration
 */

import type { CircuitState } from './circuit-breaker-types';

/**
 * Конфигурация Circuit Breaker
 */
export interface CircuitBreakerConfig {
  readonly failureThreshold: number;
  readonly halfOpenTimeout: number;
  readonly openTimeout: number;
  readonly slidingWindowSize: number;
}

/**
 * Значения по умолчанию
 */
export const DEFAULT_CIRCUIT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  halfOpenTimeout: 60000,
  openTimeout: 30000,
  slidingWindowSize: 10000
} as const;

/**
 * Статистика для мониторинга
 */
export interface CircuitStats {
  readonly state: CircuitState;
  readonly failureCount: number;
  readonly successCount: number;
  readonly failuresInWindow: number;
  readonly lastFailureTime: number;
  readonly lastStateChange: number;
}
