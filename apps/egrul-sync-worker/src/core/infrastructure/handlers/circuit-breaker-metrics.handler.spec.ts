/**
 * Спецификация для CircuitBreakerMetricsHandler
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CircuitBreakerMetricsHandler, CIRCUIT_BREAKER_METRICS } from './circuit-breaker-metrics.handler';
import type { IMetricsCollectorPort } from '../../ports/i-metrics-collector.port';
import type {
  StateChangeEvent,
  FailureEvent,
  SuccessEvent,
  ResetEvent
} from '../../ports/i-circuit-breaker-events.port';
import { CircuitState } from '../../ports/i-circuit-breaker.port';

describe('CircuitBreakerMetricsHandler', () => {
  let mockMetrics: IMetricsCollectorPort;
  let handler: CircuitBreakerMetricsHandler;

  beforeEach(() => {
    mockMetrics = {
      recordGauge: vi.fn(),
      recordCounter: vi.fn(),
      recordHistogram: vi.fn(),
      recordTiming: vi.fn(),
      recordProgress: vi.fn(),
      recordMemoryMetrics: vi.fn()
    };
    handler = new CircuitBreakerMetricsHandler(mockMetrics);
  });

  describe('onStateChange()', () => {
    it('should record state change counter', () => {
      const event: StateChangeEvent = {
        breakerName: 'api',
        previousState: CircuitState.CLOSED,
        newState: CircuitState.OPEN,
        timestamp: 1000,
        reason: 'threshold_exceeded'
      };

      handler.onStateChange(event);

      expect(mockMetrics.recordCounter).toHaveBeenCalledWith(
        CIRCUIT_BREAKER_METRICS.STATE_CHANGE,
        1,
        {
          circuit: 'api',
          from: 'closed',
          to: 'open',
          reason: 'threshold_exceeded'
        }
      );
    });

    it('should record state gauge', () => {
      const event: StateChangeEvent = {
        breakerName: 'api',
        previousState: CircuitState.CLOSED,
        newState: CircuitState.HALF_OPEN,
        timestamp: 1000,
        reason: 'timeout_elapsed'
      };

      handler.onStateChange(event);

      expect(mockMetrics.recordGauge).toHaveBeenCalledWith(
        CIRCUIT_BREAKER_METRICS.STATE,
        0.5,
        { circuit: 'api' }
      );
    });

    it('should record 0 for closed state', () => {
      const event: StateChangeEvent = {
        breakerName: 'api',
        previousState: CircuitState.OPEN,
        newState: CircuitState.CLOSED,
        timestamp: 1000,
        reason: 'success_threshold'
      };

      handler.onStateChange(event);

      expect(mockMetrics.recordGauge).toHaveBeenCalledWith(
        CIRCUIT_BREAKER_METRICS.STATE,
        0,
        { circuit: 'api' }
      );
    });

    it('should record 1 for open state', () => {
      const event: StateChangeEvent = {
        breakerName: 'api',
        previousState: CircuitState.CLOSED,
        newState: CircuitState.OPEN,
        timestamp: 1000,
        reason: 'threshold_exceeded'
      };

      handler.onStateChange(event);

      expect(mockMetrics.recordGauge).toHaveBeenCalledWith(
        CIRCUIT_BREAKER_METRICS.STATE,
        1,
        { circuit: 'api' }
      );
    });
  });

  describe('onFailure()', () => {
    it('should record failure counter', () => {
      const event: FailureEvent = {
        breakerName: 'api',
        state: CircuitState.CLOSED,
        error: new Error('Connection failed'),
        timestamp: 1000,
        failureCount: 3,
        failuresInWindow: 3
      };

      handler.onFailure(event);

      expect(mockMetrics.recordCounter).toHaveBeenCalledWith(
        CIRCUIT_BREAKER_METRICS.FAILURE,
        1,
        {
          circuit: 'api',
          state: 'closed',
          error_type: 'Error'
        }
      );
    });

    it('should record failure count gauge', () => {
      const event: FailureEvent = {
        breakerName: 'api',
        state: CircuitState.CLOSED,
        error: new Error('Connection failed'),
        timestamp: 1000,
        failureCount: 5,
        failuresInWindow: 3
      };

      handler.onFailure(event);

      expect(mockMetrics.recordGauge).toHaveBeenCalledWith(
        CIRCUIT_BREAKER_METRICS.FAILURE_COUNT,
        5,
        { circuit: 'api' }
      );
    });

    it('should record failures in window gauge', () => {
      const event: FailureEvent = {
        breakerName: 'api',
        state: CircuitState.CLOSED,
        error: new TypeError('Invalid response'),
        timestamp: 1000,
        failureCount: 5,
        failuresInWindow: 2
      };

      handler.onFailure(event);

      expect(mockMetrics.recordGauge).toHaveBeenCalledWith(
        CIRCUIT_BREAKER_METRICS.FAILURES_IN_WINDOW,
        2,
        { circuit: 'api' }
      );
    });
  });

  describe('onSuccess()', () => {
    it('should record success counter', () => {
      const event: SuccessEvent = {
        breakerName: 'api',
        state: CircuitState.CLOSED,
        timestamp: 1000,
        successCount: 1
      };

      handler.onSuccess(event);

      expect(mockMetrics.recordCounter).toHaveBeenCalledWith(
        CIRCUIT_BREAKER_METRICS.SUCCESS,
        1,
        {
          circuit: 'api',
          state: 'closed'
        }
      );
    });

    it('should record success count gauge', () => {
      const event: SuccessEvent = {
        breakerName: 'api',
        state: CircuitState.HALF_OPEN,
        timestamp: 1000,
        successCount: 3
      };

      handler.onSuccess(event);

      expect(mockMetrics.recordGauge).toHaveBeenCalledWith(
        CIRCUIT_BREAKER_METRICS.SUCCESS_COUNT,
        3,
        { circuit: 'api' }
      );
    });
  });

  describe('onReset()', () => {
    it('should record reset counter', () => {
      const event: ResetEvent = {
        breakerName: 'api',
        previousState: CircuitState.OPEN,
        timestamp: 1000
      };

      handler.onReset(event);

      expect(mockMetrics.recordCounter).toHaveBeenCalledWith(
        CIRCUIT_BREAKER_METRICS.RESET,
        1,
        {
          circuit: 'api',
          from: 'open'
        }
      );
    });

    it('should record state as closed (0)', () => {
      const event: ResetEvent = {
        breakerName: 'api',
        previousState: CircuitState.OPEN,
        timestamp: 1000
      };

      handler.onReset(event);

      expect(mockMetrics.recordGauge).toHaveBeenCalledWith(
        CIRCUIT_BREAKER_METRICS.STATE,
        0,
        { circuit: 'api' }
      );
    });
  });

  describe('CIRCUIT_BREAKER_METRICS constants', () => {
    it('should have all metric names', () => {
      expect(CIRCUIT_BREAKER_METRICS).toMatchObject({
        STATE_CHANGE: 'circuit.state_change',
        STATE: 'circuit.state',
        SUCCESS: 'circuit.success',
        FAILURE: 'circuit.failure',
        BLOCKED: 'circuit.blocked',
        RESET: 'circuit.reset',
        HALF_OPEN_CALLS: 'circuit.half_open_calls',
        FAILURE_COUNT: 'circuit.failure_count',
        SUCCESS_COUNT: 'circuit.success_count',
        FAILURES_IN_WINDOW: 'circuit.failures_in_window',
        LAST_FAILURE_AGE: 'circuit.last_failure_age',
        STATE_DURATION: 'circuit.state_duration'
      });
    });
  });

  describe('integration', () => {
    it('should handle all events in sequence', () => {
      // State change
      handler.onStateChange({
        breakerName: 'api',
        previousState: CircuitState.CLOSED,
        newState: CircuitState.OPEN,
        timestamp: 1000,
        reason: 'threshold_exceeded'
      });

      // Failures
      handler.onFailure({
        breakerName: 'api',
        state: CircuitState.OPEN,
        error: new Error('Failed'),
        timestamp: 1000,
        failureCount: 5,
        failuresInWindow: 5
      });

      // Reset
      handler.onReset({
        breakerName: 'api',
        previousState: CircuitState.OPEN,
        timestamp: 2000
      });

      // Success
      handler.onSuccess({
        breakerName: 'api',
        state: CircuitState.CLOSED,
        timestamp: 2000,
        successCount: 1
      });

      expect(mockMetrics.recordCounter).toHaveBeenCalledTimes(4);
      expect(mockMetrics.recordGauge).toHaveBeenCalledTimes(5);
    });
  });
});
