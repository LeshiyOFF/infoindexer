/**
 * Константы для Circuit Breaker Metrics
 *
 * @remarks
 * Infrastructure Layer — Constants в Hexagonal Architecture.
 * Содержит имена метрик для Circuit Breaker.
 */

/**
 * Константы для имён метрик
 *
 * @remarks
 * Value Object: неизменяемый (as const).
 */
export const CIRCUIT_BREAKER_METRICS = {
  // State metrics
  STATE_CHANGE: 'circuit.state_change',
  STATE: 'circuit.state',

  // Counters
  SUCCESS: 'circuit.success',
  FAILURE: 'circuit.failure',
  BLOCKED: 'circuit.blocked',
  RESET: 'circuit.reset',
  HALF_OPEN_CALLS: 'circuit.half_open_calls',

  // Gauges
  FAILURE_COUNT: 'circuit.failure_count',
  SUCCESS_COUNT: 'circuit.success_count',
  FAILURES_IN_WINDOW: 'circuit.failures_in_window',

  // Timing
  LAST_FAILURE_AGE: 'circuit.last_failure_age',
  STATE_DURATION: 'circuit.state_duration'
} as const;
