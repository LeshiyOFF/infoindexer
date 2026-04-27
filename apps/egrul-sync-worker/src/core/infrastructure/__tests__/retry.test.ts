/**
 * Retry Policy Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { RetryPolicy, RetryStrategies } from '../retry';

describe('RetryPolicy', () => {
  it('повторяет при ошибке до maxAttempts', async () => {
    const retry = new RetryPolicy({
      maxAttempts: 3,
      baseDelay: 10,
      maxDelay: 100,
      strategy: 'constant',
      multiplier: 1,
      jitter: 0
    });

    let attempts = 0;
    const failingFn = async () => {
      attempts++;
      throw new Error('Failed');
    };

    const result = await retry.execute(failingFn);

    expect(result.success).toBe(false);
    expect(result.attempts).toBe(3);
    expect(attempts).toBe(3);
  });

  it('возвращает успех при первой удачной попытке', async () => {
    const retry = new RetryPolicy({
      maxAttempts: 3,
      baseDelay: 10,
      maxDelay: 100,
      strategy: 'constant',
      multiplier: 1,
      jitter: 0
    });

    let attempts = 0;
    const fn = async () => {
      attempts++;
      if (attempts < 2) throw new Error('Failed');
      return 'success';
    };

    const result = await retry.execute(fn);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBe('success');
      expect(result.attempts).toBe(2);
    }
  });

  it('использует exponential backoff', async () => {
    const delays: number[] = [];
    const retry = new RetryPolicy({
      maxAttempts: 4,
      baseDelay: 100,
      maxDelay: 10000,
      strategy: 'exponential',
      multiplier: 2,
      jitter: 0
    }, undefined);

    // Подменяем sleep метод
    retry['sleep'] = async (ms: number) => {
      delays.push(ms);
    };

    let attempts = 0;
    const failingFn = async () => {
      attempts++;
      throw new Error('Failed');
    };

    await retry.execute(failingFn);

    // exponential: 100, 200, 400
    expect(delays).toEqual([100, 200, 400]);
  });

  it('уважает maxDelay', async () => {
    const delays: number[] = [];
    const retry = new RetryPolicy({
      maxAttempts: 5,
      baseDelay: 1000,
      maxDelay: 1500,
      strategy: 'exponential',
      multiplier: 4,
      jitter: 0
    });

    retry['sleep'] = async (ms: number) => {
      delays.push(ms);
    };

    const failingFn = async (): Promise<never> => {
      throw new Error('Failed');
    };

    await retry.execute(failingFn);

    // exponential: 1000, 4000->1500, 16000->1500, ...
    delays.forEach(d => expect(d).toBeLessThanOrEqual(1500));
  });

  it('передаёт контекст попытки в функцию', async () => {
    const retry = new RetryPolicy({
      maxAttempts: 3,
      baseDelay: 10,
      maxDelay: 100,
      strategy: 'constant',
      multiplier: 1,
      jitter: 0
    });

    const contexts: Array<{ attempt: number; totalAttempts: number }> = [];

    const fn = async (ctx: { attempt: number; totalAttempts: number }) => {
      contexts.push({ attempt: ctx.attempt, totalAttempts: ctx.totalAttempts });
      throw new Error('Failed');
    };

    await retry.execute(fn);

    expect(contexts).toHaveLength(3);
    expect(contexts[0]).toEqual({ attempt: 1, totalAttempts: 3 });
    expect(contexts[1]).toEqual({ attempt: 2, totalAttempts: 3 });
    expect(contexts[2]).toEqual({ attempt: 3, totalAttempts: 3 });
  });

  it('применяет jitter для разброса задержек', async () => {
    const delays: number[] = [];
    const random = vi.fn(() => 0.5);
    const retry = new RetryPolicy({
      maxAttempts: 2,
      baseDelay: 100,
      maxDelay: 1000,
      strategy: 'constant',
      multiplier: 1,
      jitter: 0.2
    }, random);

    retry['sleep'] = async (ms: number) => {
      delays.push(ms);
    };

    const failingFn = async (): Promise<never> => {
      throw new Error('Failed');
    };

    await retry.execute(failingFn);

    // 100 ± (0.5 - 0.5) * 2 * 20 = 100
    expect(delays[0]).toBe(100);
  });

  it('создаёт новую политику через withConfig', () => {
    const retry = new RetryPolicy({
      maxAttempts: 3,
      baseDelay: 100,
      maxDelay: 1000,
      strategy: 'constant',
      multiplier: 1,
      jitter: 0
    });

    const modified = retry.withConfig({ maxAttempts: 5 });

    expect(modified.config.maxAttempts).toBe(5);
    expect(modified.config.baseDelay).toBe(100); // неизменное
  });

  describe('RetryStrategies', () => {
    it('имеет предопределённые стратегии', () => {
      expect(RetryStrategies.fast).toBeInstanceOf(RetryPolicy);
      expect(RetryStrategies.standard).toBeInstanceOf(RetryPolicy);
      expect(RetryStrategies.slow).toBeInstanceOf(RetryPolicy);
      expect(RetryStrategies.linear).toBeInstanceOf(RetryPolicy);
    });

    it('fast стратегия имеет короткие задержки', () => {
      expect(RetryStrategies.fast.config.baseDelay).toBe(100);
      expect(RetryStrategies.fast.config.maxDelay).toBe(1000);
    });

    it('slow стратегия имеет длинные задержки', () => {
      expect(RetryStrategies.slow.config.baseDelay).toBe(2000);
      expect(RetryStrategies.slow.config.maxDelay).toBe(30000);
    });
  });
});
