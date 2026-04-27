/**
 * Спецификация для CircuitBreakerManager
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CircuitBreakerManager } from './circuit-breaker-manager.service';
import type { ICircuitBreakerPort } from '../ports/i-circuit-breaker.port';
import { CircuitState } from '../ports/i-circuit-breaker.port';
import { CircuitBreakerAdapter } from '../infrastructure/adapters/circuit-breaker.adapter';
import { CircuitBreakerConfigFactory } from './factories/circuit-breaker-config.factory';

describe('CircuitBreakerManager', () => {
  let manager: CircuitBreakerManager;
  let mockBreaker: ICircuitBreakerPort;

  beforeEach(() => {
    manager = new CircuitBreakerManager();
    mockBreaker = {
      execute: vi.fn().mockResolvedValue({
        success: true,
        state: CircuitState.CLOSED,
        value: 'ok'
      }),
      executeWithFallback: vi.fn(),
      getState: vi.fn().mockReturnValue(CircuitState.CLOSED),
      getStats: vi.fn().mockReturnValue({
        state: CircuitState.CLOSED,
        failureCount: 0,
        successCount: 0,
        failuresInWindow: 0,
        lastFailureTime: 0,
        lastStateChange: 0,
        nextAttemptTime: 0
      }),
      reset: vi.fn(),
      canProceed: vi.fn().mockReturnValue(true)
    };
  });

  describe('registerFactory()', () => {
    it('should register factory', () => {
      const factory = vi.fn().mockReturnValue(mockBreaker);
      manager.registerFactory('api', factory);

      expect(manager.has('api')).toBe(true);
    });

    it('should create breaker on first access', async () => {
      const factory = vi.fn().mockReturnValue(mockBreaker);
      manager.registerFactory('api', factory);

      await manager.execute('api', async () => 'test');

      expect(factory).toHaveBeenCalledTimes(1);
    });
  });

  describe('register()', () => {
    it('should register existing breaker', () => {
      manager.register('direct', mockBreaker);

      expect(manager.has('direct')).toBe(true);
      expect(manager.names()).toContain('direct');
    });

    it('should throw on duplicate registration', () => {
      manager.register('api', mockBreaker);

      expect(() => manager.register('api', mockBreaker))
        .toThrow('already exists');
    });
  });

  describe('has()', () => {
    it('should return false for non-existent breaker', () => {
      expect(manager.has('nonexistent')).toBe(false);
    });

    it('should return true for registered factory', () => {
      manager.registerFactory('api', () => mockBreaker);
      expect(manager.has('api')).toBe(true);
    });

    it('should return true for registered breaker', () => {
      manager.register('direct', mockBreaker);
      expect(manager.has('direct')).toBe(true);
    });
  });

  describe('names()', () => {
    it('should return empty array initially', () => {
      expect(manager.names()).toEqual([]);
    });

    it('should return all registered names', () => {
      manager.register('a', mockBreaker);
      manager.registerFactory('b', () => mockBreaker);

      const names = manager.names();
      expect(names).toContain('a');
      expect(names).toContain('b');
    });
  });

  describe('execute()', () => {
    it('should execute operation through breaker', async () => {
      manager.register('api', mockBreaker);

      const result = await manager.execute('api', async () => 'test');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe('ok');
      }
      expect(mockBreaker.execute).toHaveBeenCalledTimes(1);
    });

    it('should create breaker via factory if needed', async () => {
      const factory = vi.fn().mockReturnValue(mockBreaker);
      manager.registerFactory('api', factory);

      await manager.execute('api', async () => 'test');

      expect(factory).toHaveBeenCalledTimes(1);
      expect(mockBreaker.execute).toHaveBeenCalledTimes(1);
    });

    it('should throw on non-existent breaker', async () => {
      await expect(manager.execute('nonexistent', async () => 'test'))
        .rejects.toThrow('No circuit breaker or factory');
    });
  });

  describe('executeWithFallback()', () => {
    it('should execute with fallback through breaker', async () => {
      const fallback = vi.fn().mockResolvedValue('fallback');
      (mockBreaker.executeWithFallback as unknown as ReturnType<typeof vi.fn>).mockResolvedValue('fallback');

      manager.register('api', mockBreaker);

      const result = await manager.executeWithFallback(
        'api',
        async () => { throw new Error('fail'); },
        fallback
      );

      expect(result).toBe('fallback');
      expect(mockBreaker.executeWithFallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('getState()', () => {
    it('should return CLOSED for non-existent breaker', () => {
      expect(manager.getState('nonexistent')).toBe(CircuitState.CLOSED);
    });

    it('should return breaker state', () => {
      manager.register('api', mockBreaker);

      expect(manager.getState('api')).toBe(CircuitState.CLOSED);
    });
  });

  describe('getHealth()', () => {
    it('should return empty health initially', () => {
      const health = manager.getHealth();

      expect(health.total).toBe(0);
      expect(health.closed).toBe(0);
      expect(health.open).toBe(0);
      expect(health.halfOpen).toBe(0);
    });

    it('should aggregate breaker health', () => {
      const closedBreaker: ICircuitBreakerPort = {
        execute: vi.fn().mockResolvedValue({ success: true, state: CircuitState.CLOSED, value: 'ok' }),
        executeWithFallback: vi.fn(),
        getState: vi.fn().mockReturnValue(CircuitState.CLOSED),
        getStats: vi.fn().mockReturnValue({
          state: CircuitState.CLOSED,
          failureCount: 0,
          successCount: 0,
          failuresInWindow: 0,
          lastFailureTime: 0,
          lastStateChange: 0,
          nextAttemptTime: 0
        }),
        reset: vi.fn(),
        canProceed: vi.fn().mockReturnValue(true)
      };

      const openBreaker: ICircuitBreakerPort = {
        execute: vi.fn().mockResolvedValue({ success: true, state: CircuitState.CLOSED, value: 'ok' }),
        executeWithFallback: vi.fn(),
        getState: vi.fn().mockReturnValue(CircuitState.OPEN),
        getStats: vi.fn().mockReturnValue({
          state: CircuitState.OPEN,
          failureCount: 5,
          successCount: 0,
          failuresInWindow: 5,
          lastFailureTime: Date.now(),
          lastStateChange: Date.now(),
          nextAttemptTime: 0
        }),
        reset: vi.fn(),
        canProceed: vi.fn().mockReturnValue(false)
      };

      manager.register('closed', closedBreaker);
      manager.register('open', openBreaker);

      const health = manager.getHealth();

      expect(health.total).toBe(2);
      expect(health.closed).toBe(1);
      expect(health.open).toBe(1);
    });
  });

  describe('isAllClosed()', () => {
    it('should return true when no breakers', () => {
      expect(manager.isAllClosed()).toBe(true);
    });

    it('should return true when all closed', () => {
      manager.register('a', mockBreaker);
      manager.register('b', mockBreaker);

      expect(manager.isAllClosed()).toBe(true);
    });

    it('should return false when has open breaker', () => {
      const openBreaker: ICircuitBreakerPort = {
        execute: vi.fn().mockResolvedValue({ success: false, state: CircuitState.OPEN, error: 'circuit_open' }),
        executeWithFallback: vi.fn(),
        getState: vi.fn().mockReturnValue(CircuitState.OPEN),
        getStats: vi.fn().mockReturnValue({
          state: CircuitState.OPEN,
          failureCount: 5,
          successCount: 0,
          failuresInWindow: 5,
          lastFailureTime: Date.now(),
          lastStateChange: Date.now(),
          nextAttemptTime: 0
        }),
        reset: vi.fn(),
        canProceed: vi.fn().mockReturnValue(false)
      };

      manager.register('closed', mockBreaker);
      manager.register('open', openBreaker);

      expect(manager.isAllClosed()).toBe(false);
    });
  });

  describe('getOpenBreakers()', () => {
    it('should return empty array when no breakers', () => {
      expect(manager.getOpenBreakers()).toEqual([]);
    });

    it('should return names of open breakers', () => {
      const createOpenBreaker = (): ICircuitBreakerPort => ({
        execute: vi.fn().mockResolvedValue({ success: false, state: CircuitState.OPEN, error: 'circuit_open' }),
        executeWithFallback: vi.fn(),
        getState: vi.fn().mockReturnValue(CircuitState.OPEN),
        getStats: vi.fn().mockReturnValue({
          state: CircuitState.OPEN,
          failureCount: 5,
          successCount: 0,
          failuresInWindow: 5,
          lastFailureTime: Date.now(),
          lastStateChange: Date.now(),
          nextAttemptTime: 0
        }),
        reset: vi.fn(),
        canProceed: vi.fn().mockReturnValue(false)
      });

      manager.register('closed', mockBreaker);
      manager.register('open1', createOpenBreaker());
      manager.register('open2', createOpenBreaker());

      const open = manager.getOpenBreakers();

      expect(open).toContain('open1');
      expect(open).toContain('open2');
      expect(open).not.toContain('closed');
    });
  });

  describe('reset()', () => {
    it('should return false for non-existent breaker', () => {
      expect(manager.reset('nonexistent')).toBe(false);
    });

    it('should reset breaker', () => {
      manager.register('api', mockBreaker);

      const result = manager.reset('api');

      expect(result).toBe(true);
      expect(mockBreaker.reset).toHaveBeenCalledTimes(1);
    });
  });

  describe('resetAll()', () => {
    it('should reset all breakers', () => {
      manager.register('a', mockBreaker);
      manager.register('b', mockBreaker);

      manager.resetAll();

      expect(mockBreaker.reset).toHaveBeenCalledTimes(2);
    });
  });

  describe('integration with CircuitBreakerAdapter', () => {
    it('should work with real adapter', async () => {
      const config = CircuitBreakerConfigFactory.default();
      const adapter = new CircuitBreakerAdapter('test', config);

      manager.register('test', adapter);

      // Первое выполнение - успех
      const result1 = await manager.execute('test', async () => 'success');
      expect(result1.success).toBe(true);
      if (result1.success) {
        expect(result1.value).toBe('success');
      }

      // Состояние должно быть 'CLOSED'
      expect(manager.getState('test')).toBe(CircuitState.CLOSED);

      // Health check
      const health = manager.getHealth();
      expect(health.total).toBe(1);
      expect(health.closed).toBe(1);
    });

    it('should track failures through manager', async () => {
      const config = CircuitBreakerConfigFactory.forDatabase(); // 3 failures threshold
      const adapter = new CircuitBreakerAdapter('db', config);

      manager.register('db', adapter);

      // Три неудачи
      for (let i = 0; i < 3; i++) {
        await manager.execute('db', async () => {
          throw new Error('Connection failed');
        }).catch(() => undefined);
      }

      // Четвёртая попытка должна быть заблокирована
      const result = await manager.execute('db', async () => 'success');

      expect(result.success).toBe(false);
      expect(result.state).toBe(CircuitState.OPEN);
      expect(manager.getState('db')).toBe(CircuitState.OPEN);
    });
  });
});
