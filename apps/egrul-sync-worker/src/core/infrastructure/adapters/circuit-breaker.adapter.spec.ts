/**
 * Спецификация для CircuitBreakerAdapter
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CircuitBreakerAdapter } from './circuit-breaker.adapter';
import type { IMetricsCollectorPort } from '../../ports/i-metrics-collector.port';
import type { ICircuitBreakerEventsPort } from '../../ports/i-circuit-breaker-events.port';
import type { CircuitBreakerConfig } from '../../ports/i-circuit-breaker.port';
import { CircuitState } from '../../ports/i-circuit-breaker.port';

describe('CircuitBreakerAdapter', () => {
  const mockNow = vi.fn(() => 0);
  const mockMetrics: IMetricsCollectorPort = {
    recordGauge: vi.fn(),
    recordCounter: vi.fn(),
    recordHistogram: vi.fn(),
    recordTiming: vi.fn(),
    recordProgress: vi.fn(),
    recordMemoryMetrics: vi.fn()
  };
  const mockEvents: Required<ICircuitBreakerEventsPort> = {
    onStateChange: vi.fn(),
    onFailure: vi.fn(),
    onSuccess: vi.fn(),
    onReset: vi.fn()
  };

  const config: CircuitBreakerConfig = {
    failureThreshold: 3,
    openTimeout: 1000,
    halfOpenTimeout: 500,
    slidingWindowSize: 10000,
    halfOpenMaxCalls: 2,
    successThreshold: 2
  };

  let adapter: CircuitBreakerAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    mockNow.mockReturnValue(0);
    adapter = new CircuitBreakerAdapter('test', config, mockMetrics, mockEvents, mockNow);
  });

  describe('execute()', () => {
    it('should execute function successfully', async () => {
      const fn = vi.fn().mockResolvedValue('result');

      const result = await adapter.execute(fn);

      expect(result).toEqual({
        success: true,
        state: CircuitState.CLOSED,
        value: 'result'
      });
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should open circuit after threshold failures', async () => {
      const failingFn = vi.fn().mockRejectedValue(new Error('Failed'));

      const r1 = await adapter.execute(failingFn);
      const r2 = await adapter.execute(failingFn);
      const r3 = await adapter.execute(failingFn);

      expect(r1.success).toBe(false);
      if (!r1.success) expect(r1.error).toBe('execution_failed');

      expect(r2.success).toBe(false);
      if (!r2.success) expect(r2.error).toBe('execution_failed');

      expect(r3.success).toBe(false);
      if (!r3.success) expect(r3.error).toBe('circuit_open');
      expect(adapter.getState()).toBe('open');
    });

    it('should block requests when open', async () => {
      const failingFn = vi.fn().mockRejectedValue(new Error('Failed'));

      // Open the circuit
      await adapter.execute(failingFn);
      await adapter.execute(failingFn);
      await adapter.execute(failingFn);

      // Try again - should be blocked
      const successFn = vi.fn().mockResolvedValue('ok');
      const result = await adapter.execute(successFn);

      expect(result).toEqual({
        success: false,
        state: 'open',
        error: 'circuit_open'
      });
      expect(successFn).not.toHaveBeenCalled();
    });

    it('should transition to half_open after timeout', async () => {
      const failingFn = vi.fn().mockRejectedValue(new Error('Failed'));
      const successFn = vi.fn().mockResolvedValue('ok');

      // Open the circuit
      await adapter.execute(failingFn);
      await adapter.execute(failingFn);
      await adapter.execute(failingFn);

      // Advance time past openTimeout
      mockNow.mockReturnValue(1001);

      const result = await adapter.execute(successFn);

      expect(result.success).toBe(true);
      expect(adapter.getState()).toBe('half_open');
    });

    it('should close after successful calls in half_open', async () => {
      const failingFn = vi.fn().mockRejectedValue(new Error('Failed'));
      const successFn = vi.fn().mockResolvedValue('ok');

      // Open the circuit
      await adapter.execute(failingFn);
      await adapter.execute(failingFn);
      await adapter.execute(failingFn);

      // Advance time to half_open
      mockNow.mockReturnValue(1001);

      // Success 1 -> still half_open
      await adapter.execute(successFn);
      expect(adapter.getState()).toBe('half_open');

      // Success 2 -> closed
      await adapter.execute(successFn);
      expect(adapter.getState()).toBe('closed');
    });

    it('should reopen on failure in half_open', async () => {
      const failingFn = vi.fn().mockRejectedValue(new Error('Failed'));

      // Open the circuit
      await adapter.execute(failingFn);
      await adapter.execute(failingFn);
      await adapter.execute(failingFn);

      // Advance time to half_open
      mockNow.mockReturnValue(1001);

      // Fail in half_open -> back to open
      const result = await adapter.execute(failingFn);

      expect(result.success).toBe(false);
      expect(adapter.getState()).toBe('open');
    });
  });

  describe('executeWithFallback()', () => {
    it('should return result on success', async () => {
      const fn = vi.fn().mockResolvedValue('result');
      const fallback = vi.fn();

      const result = await adapter.executeWithFallback(fn, fallback);

      expect(result).toBe('result');
      expect(fallback).not.toHaveBeenCalled();
    });

    it('should call fallback on circuit_open', async () => {
      const failingFn = vi.fn().mockRejectedValue(new Error('Failed'));
      const fallback = vi.fn().mockResolvedValue('fallback');

      // Open the circuit
      await adapter.execute(failingFn);
      await adapter.execute(failingFn);
      await adapter.execute(failingFn);

      const result = await adapter.executeWithFallback(
        vi.fn().mockResolvedValue('ok'),
        fallback
      );

      expect(result).toBe('fallback');
      expect(fallback).toHaveBeenCalledWith('circuit_open');
    });

    it('should call fallback on execution_failed', async () => {
      const fallback = vi.fn().mockResolvedValue('fallback');

      const result = await adapter.executeWithFallback(
        vi.fn().mockRejectedValue(new Error('Failed')),
        fallback
      );

      expect(result).toBe('fallback');
      expect(fallback).toHaveBeenCalledWith('execution_failed');
    });
  });

  describe('getState()', () => {
    it('should return closed initially', () => {
      expect(adapter.getState()).toBe('closed');
    });

    it('should return open after threshold', async () => {
      const failingFn = vi.fn().mockRejectedValue(new Error('Failed'));

      await adapter.execute(failingFn);
      await adapter.execute(failingFn);
      await adapter.execute(failingFn);

      expect(adapter.getState()).toBe('open');
    });
  });

  describe('getStats()', () => {
    it('should return stats', () => {
      const stats = adapter.getStats();

      expect(stats).toHaveProperty('state');
      expect(stats).toHaveProperty('failureCount');
      expect(stats).toHaveProperty('successCount');
      expect(stats).toHaveProperty('failuresInWindow');
      expect(stats).toHaveProperty('lastFailureTime');
      expect(stats).toHaveProperty('lastStateChange');
      expect(stats).toHaveProperty('nextAttemptTime');
    });

    it('should track failures', async () => {
      const failingFn = vi.fn().mockRejectedValue(new Error('Failed'));

      await adapter.execute(failingFn);
      await adapter.execute(failingFn);

      const stats = adapter.getStats();

      expect(stats.failureCount).toBe(2);
      expect(stats.failuresInWindow).toBe(2);
    });
  });

  describe('reset()', () => {
    it('should reset to closed', async () => {
      const failingFn = vi.fn().mockRejectedValue(new Error('Failed'));

      await adapter.execute(failingFn);
      await adapter.execute(failingFn);
      await adapter.execute(failingFn);

      expect(adapter.getState()).toBe('open');

      adapter.reset();

      expect(adapter.getState()).toBe('closed');
      const stats = adapter.getStats();
      expect(stats.failureCount).toBe(0);
    });

    it('should emit reset event', async () => {
      const failingFn = vi.fn().mockRejectedValue(new Error('Failed'));

      await adapter.execute(failingFn);
      await adapter.execute(failingFn);
      await adapter.execute(failingFn);

      adapter.reset();

      expect(mockEvents.onReset).toHaveBeenCalled();
    });
  });

  describe('canProceed()', () => {
    it('should return true when closed', () => {
      expect(adapter.canProceed()).toBe(true);
    });

    it('should return false when open', async () => {
      const failingFn = vi.fn().mockRejectedValue(new Error('Failed'));

      await adapter.execute(failingFn);
      await adapter.execute(failingFn);
      await adapter.execute(failingFn);

      expect(adapter.canProceed()).toBe(false);
    });

    it('should return true after timeout', async () => {
      const failingFn = vi.fn().mockRejectedValue(new Error('Failed'));

      await adapter.execute(failingFn);
      await adapter.execute(failingFn);
      await adapter.execute(failingFn);

      mockNow.mockReturnValue(1001);

      expect(adapter.canProceed()).toBe(true);
    });
  });

  describe('metrics integration', () => {
    it('should record success metric', async () => {
      adapter.reset();

      await adapter.execute(vi.fn().mockResolvedValue('ok'));

      expect(mockMetrics.recordCounter).toHaveBeenCalledWith(
        'circuit.success',
        1,
        { circuit: 'test' }
      );
    });

    it('should record failure metric', async () => {
      adapter.reset();

      await adapter.execute(vi.fn().mockRejectedValue(new Error('Failed')));

      expect(mockMetrics.recordCounter).toHaveBeenCalledWith(
        'circuit.failure',
        1,
        { circuit: 'test', error: 'Error' }
      );
    });

    it('should record blocked metric', async () => {
      adapter.reset();
      const failingFn = vi.fn().mockRejectedValue(new Error('Failed'));

      await adapter.execute(failingFn);
      await adapter.execute(failingFn);
      await adapter.execute(failingFn);

      await adapter.execute(vi.fn().mockResolvedValue('ok'));

      expect(mockMetrics.recordCounter).toHaveBeenCalledWith(
        'circuit.blocked',
        1,
        { circuit: 'test' }
      );
    });
  });

  describe('events integration', () => {
    it('should emit success event', async () => {
      adapter.reset();

      await adapter.execute(vi.fn().mockResolvedValue('ok'));

      expect(mockEvents.onSuccess).toHaveBeenCalledWith({
        breakerName: 'test',
        state: CircuitState.CLOSED,
        timestamp: 0,
        successCount: 1
      });
    });

    it('should emit failure event', async () => {
      adapter.reset();
      const error = new Error('Failed');

      await adapter.execute(vi.fn().mockRejectedValue(error));

      expect(mockEvents.onFailure).toHaveBeenCalledWith({
        breakerName: 'test',
        state: CircuitState.CLOSED,
        error,
        timestamp: 0,
        failureCount: 1,
        failuresInWindow: 1
      });
    });
  });

  describe('without metrics and events', () => {
    it('should work without metrics', async () => {
      const noMetricsAdapter = new CircuitBreakerAdapter('test', config);

      const result = await noMetricsAdapter.execute(vi.fn().mockResolvedValue('ok'));

      expect(result.success).toBe(true);
    });

    it('should work without events', async () => {
      const noEventsAdapter = new CircuitBreakerAdapter(
        'test',
        config,
        mockMetrics
      );

      const result = await noEventsAdapter.execute(vi.fn().mockResolvedValue('ok'));

      expect(result.success).toBe(true);
    });

    it('should work with neither', async () => {
      const minimalAdapter = new CircuitBreakerAdapter('test', config);

      const result = await minimalAdapter.execute(vi.fn().mockResolvedValue('ok'));

      expect(result.success).toBe(true);
      expect(minimalAdapter.getState()).toBe('closed');
    });
  });
});
