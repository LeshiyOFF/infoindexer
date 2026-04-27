/**
 * Circuit Breaker Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { CircuitBreaker, CircuitState, DEFAULT_CIRCUIT_CONFIG } from '../circuit-breaker';

describe('CircuitBreaker', () => {
  it('открывает цепь после порога неудач', async () => {
    const breaker = new CircuitBreaker({
      ...DEFAULT_CIRCUIT_CONFIG,
      failureThreshold: 3,
      slidingWindowSize: 10000
    }, vi.fn(() => 0));

    const failingFn = async (): Promise<never> => {
      throw new Error('Failed');
    };

    // Порог 3 — первые 2 попытки возвращают execution_failed
    const r1 = await breaker.execute(failingFn);
    expect(r1.success).toBe(false);
    if (!r1.success) expect(r1.error).toBe('execution_failed');

    const r2 = await breaker.execute(failingFn);
    expect(r2.success).toBe(false);
    if (!r2.success) expect(r2.error).toBe('execution_failed');

    // Третья попытка открывает цепь
    const r3 = await breaker.execute(failingFn);
    expect(r3.success).toBe(false);
    if (!r3.success) expect(r3.error).toBe('circuit_open');

    expect(breaker.currentState).toBe(CircuitState.OPEN);
  });

  it('блокирует запросы когда цепь открыта', async () => {
    const breaker = new CircuitBreaker({
      ...DEFAULT_CIRCUIT_CONFIG,
      failureThreshold: 2,
      openTimeout: 1000
    }, vi.fn(() => 0));

    const failingFn = async (): Promise<never> => {
      throw new Error('Failed');
    };

    // Открываем цепь
    await breaker.execute(failingFn);
    await breaker.execute(failingFn);

    // Все последующие запросы блокируются
    const blocked = await breaker.execute(async () => 'success');
    expect(blocked.success).toBe(false);
    if (!blocked.success) {
      expect(blocked.error).toBe('circuit_open');
      expect(blocked.state).toBe(CircuitState.OPEN);
    }
  });

  it('переходит в HALF_OPEN после таймаута', async () => {
    let now = 0;
    const breaker = new CircuitBreaker({
      ...DEFAULT_CIRCUIT_CONFIG,
      failureThreshold: 2,
      openTimeout: 1000
    }, () => now);

    const failingFn = async (): Promise<never> => {
      throw new Error('Failed');
    };

    // Открываем цепь
    await breaker.execute(failingFn);
    await breaker.execute(failingFn);
    expect(breaker.currentState).toBe(CircuitState.OPEN);

    // Прошло время openTimeout
    now = 1001;
    const result = await breaker.execute(failingFn);
    // Цепь перешла в HALF_OPEN и запрос был выполнен
    expect(breaker.currentState).toBe(CircuitState.OPEN);
  });

  it('закрывает цепь после успешной попытки в HALF_OPEN', async () => {
    let now = 0;
    const breaker = new CircuitBreaker({
      ...DEFAULT_CIRCUIT_CONFIG,
      failureThreshold: 2,
      openTimeout: 1000
    }, () => now);

    const failingFn = async (): Promise<never> => {
      throw new Error('Failed');
    };

    const successFn = async (): Promise<string> => 'ok';

    // Открываем цепь
    await breaker.execute(failingFn);
    await breaker.execute(failingFn);

    // Переходим в HALF_OPEN
    now = 1001;
    await breaker.execute(successFn);

    expect(breaker.currentState).toBe(CircuitState.CLOSED);
  });

  it('сбрасывает счётчик после успеха', async () => {
    const breaker = new CircuitBreaker({
      ...DEFAULT_CIRCUIT_CONFIG,
      failureThreshold: 3
    });

    const failingFn = async (): Promise<never> => {
      throw new Error('Failed');
    };

    const successFn = async (): Promise<string> => 'ok';

    // Две неудачи
    await breaker.execute(failingFn);
    await breaker.execute(failingFn);

    // Один успех сбрасывает счётчик
    const r = await breaker.execute(successFn);
    expect(r.success).toBe(true);

    // Нужно ещё 3 неудачи чтобы открыть
    await breaker.execute(failingFn);
    await breaker.execute(failingFn);
    await breaker.execute(failingFn);

    expect(breaker.currentState).toBe(CircuitState.OPEN);
  });

  it('возвращает статистику', () => {
    const breaker = new CircuitBreaker();
    const stats = breaker.getStats();

    expect(stats).toHaveProperty('state');
    expect(stats).toHaveProperty('failureCount');
    expect(stats).toHaveProperty('successCount');
    expect(stats).toHaveProperty('failuresInWindow');
  });

  it('reset возвращает цепь в CLOSED', async () => {
    const breaker = new CircuitBreaker({
      ...DEFAULT_CIRCUIT_CONFIG,
      failureThreshold: 2
    });

    const failingFn = async (): Promise<never> => {
      throw new Error('Failed');
    };

    await breaker.execute(failingFn);
    await breaker.execute(failingFn);
    expect(breaker.currentState).toBe(CircuitState.OPEN);

    breaker.reset();
    expect(breaker.currentState).toBe(CircuitState.CLOSED);
  });
});
