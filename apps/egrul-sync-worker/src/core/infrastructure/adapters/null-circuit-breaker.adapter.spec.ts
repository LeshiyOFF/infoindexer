/**
 * Спецификация для NullCircuitBreakerAdapter
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NullCircuitBreakerAdapter, NULL_CIRCUIT_BREAKER } from './null-circuit-breaker.adapter';

describe('NullCircuitBreakerAdapter', () => {
  let adapter: NullCircuitBreakerAdapter;

  beforeEach(() => {
    adapter = new NullCircuitBreakerAdapter('test');
  });

  describe('execute()', () => {
    it('should execute function successfully', async () => {
      const fn = () => Promise.resolve('result');

      const result = await adapter.execute(fn);

      expect(result).toEqual({
        success: true,
        state: 'closed',
        value: 'result'
      });
    });

    it('should return execution_failed on error', async () => {
      const fn = () => Promise.reject(new Error('Failed'));

      const result = await adapter.execute(fn);

      expect(result).toEqual({
        success: false,
        state: 'closed',
        error: 'execution_failed'
      });
    });

    it('should never block requests', async () => {
      const fn = () => Promise.resolve('ok');

      const result = await adapter.execute(fn);

      expect(result.success).toBe(true);
      expect(adapter.getState()).toBe('closed');
    });
  });

  describe('executeWithFallback()', () => {
    it('should return result on success', async () => {
      const fn = () => Promise.resolve('result');
      const fallback = vi.fn().mockResolvedValue('fallback');

      const result = await adapter.executeWithFallback(fn, fallback);

      expect(result).toBe('result');
      expect(fallback).not.toHaveBeenCalled();
    });

    it('should call fallback on error', async () => {
      const fn = () => Promise.reject(new Error('Failed'));
      const fallback = (error: string) => Promise.resolve(`fallback: ${error}`);

      const result = await adapter.executeWithFallback(fn, fallback);

      expect(result).toBe('fallback: execution_failed');
    });
  });

  describe('getState()', () => {
    it('should always return closed', () => {
      expect(adapter.getState()).toBe('closed');
    });
  });

  describe('getStats()', () => {
    it('should return empty stats', () => {
      const stats = adapter.getStats();

      expect(stats).toEqual({
        state: 'closed',
        failureCount: 0,
        successCount: 0,
        failuresInWindow: 0,
        lastFailureTime: 0,
        lastStateChange: 0,
        nextAttemptTime: 0
      });
    });
  });

  describe('reset()', () => {
    it('should be no-op', () => {
      expect(() => adapter.reset()).not.toThrow();
      expect(adapter.getState()).toBe('closed');
    });
  });

  describe('canProceed()', () => {
    it('should always return true', () => {
      expect(adapter.canProceed()).toBe(true);
    });
  });

  describe('breakerName', () => {
    it('should use provided name', () => {
      const namedAdapter = new NullCircuitBreakerAdapter('custom-name');

      expect(namedAdapter.breakerName).toBe('custom-name');
    });

    it('should use default name', () => {
      const defaultAdapter = new NullCircuitBreakerAdapter();

      expect(defaultAdapter.breakerName).toBe('null');
    });
  });

  describe('NULL_CIRCUIT_BREAKER singleton', () => {
    it('should be instance of NullCircuitBreakerAdapter', () => {
      expect(NULL_CIRCUIT_BREAKER).toBeInstanceOf(NullCircuitBreakerAdapter);
    });

    it('should work like any other instance', async () => {
      const result = await NULL_CIRCUIT_BREAKER.execute(() => Promise.resolve('ok'));

      expect(result.success).toBe(true);
    });

    it('should have default name', () => {
      expect(NULL_CIRCUIT_BREAKER.breakerName).toBe('null');
    });
  });

  describe('zero overhead', () => {
    it('should execute without delays', async () => {
      const start = Date.now();

      for (let i = 0; i < 1000; i++) {
        await adapter.execute(() => Promise.resolve(i));
      }

      const duration = Date.now() - start;

      // 1000 async operations should be very fast (< 100ms)
      expect(duration).toBeLessThan(100);
    });
  });
});
