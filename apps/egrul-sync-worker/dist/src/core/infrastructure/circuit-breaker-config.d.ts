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
export declare const DEFAULT_CIRCUIT_CONFIG: CircuitBreakerConfig;
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
