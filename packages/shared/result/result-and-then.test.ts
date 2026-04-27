/**
 * Result Type Tests - andThen Methods
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

describe('Result.andThen', () => {
  it('should chain successful operations', () => {
    const parse = (s: string): Result<number, TestError> =>
      Result.ok(Number.parseInt(s, 10));

    const double = (n: number): Result<number, TestError> =>
      Result.ok(n * 2);

    const result = Result.ok<string, TestError>('21')
      .andThen(parse)
      .andThen(double);

    expect(result.unwrap()).toBe(42);
  });

  it('should short-circuit on error', () => {
    const parse = (s: string): Result<number, TestError> =>
      Result.error(new TestError('parse failed', {}));

    const double = (n: number): Result<number, TestError> =>
      Result.ok(n * 2);

    const result = Result.ok<string, TestError>('invalid')
      .andThen(parse)
      .andThen(double);

    expect(result.isErr()).toBe(true);
    expect(result.match({
      ok: () => 'should not happen',
      err: (e) => e.message
    })).toBe('parse failed');
  });

  it('should not call second function if first fails', () => {
    let called = false;

    const fail = (): Result<number, TestError> =>
      Result.error(new TestError('failed', {}));

    const neverCalled = (): Result<number, TestError> => {
      called = true;
      return Result.ok(42);
    };

    Result.ok<string, TestError>('test')
      .andThen(fail)
      .andThen(neverCalled);

    expect(called).toBe(false);
  });
});

describe('Result.andThenAsync', () => {
  it('should chain async operations', async () => {
    const asyncDouble = async (n: number): Promise<Result<number, TestError>> =>
      Result.ok(n * 2);

    const result = await Result.ok<number, TestError>(21)
      .andThenAsync(asyncDouble);

    expect(result.unwrap()).toBe(42);
  });

  it('should short-circuit async chain on error', async () => {
    const asyncFail = async (): Promise<Result<number, TestError>> =>
      Result.error(new TestError('async failed', {}));

    const result = await Result.ok<number, TestError>(42)
      .andThenAsync(asyncFail);

    expect(result.isErr()).toBe(true);
  });
});
