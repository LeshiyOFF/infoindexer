/**
 * Result Type Tests - Map Methods
 */

import { describe, it, expect } from 'vitest';
import { Result } from './result';
import { DomainError } from '../domain/errors';

class TestError extends DomainError {
  constructor(message: string, context: Record<string, unknown>) {
    super(message, context);
    this.name = 'TestError';
  }
}

describe('Result.map', () => {
  it('should transform value for ok result', () => {
    const result = Result.ok<number, TestError>(5);
    const mapped = result.map(x => x * 2);

    expect(mapped.unwrap()).toBe(10);
  });

  it('should preserve error for err result', () => {
    const error = new TestError('failed', {});
    const result = Result.error<number, TestError>(error);
    const mapped = result.map(x => x * 2);

    expect(mapped.isErr()).toBe(true);
  });

  it('should support type transformation', () => {
    const result = Result.ok<number, TestError>(42);
    const mapped = result.map(x => x.toString());

    expect(mapped.unwrap()).toBe('42');
  });
});

describe('Result.mapAsync', () => {
  it('should transform value asynchronously', async () => {
    const asyncToString = async (n: number): Promise<string> =>
      n.toString();

    const result = await Result.ok<number, TestError>(42)
      .mapAsync(asyncToString);

    expect(result.unwrap()).toBe('42');
  });

  it('should preserve error for err result', async () => {
    const error = new TestError('failed', {});
    const result = Result.error<number, TestError>(error);
    const mapped = await result.mapAsync(async (n) => n.toString());

    expect(mapped.isErr()).toBe(true);
  });
});
