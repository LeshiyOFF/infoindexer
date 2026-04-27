/**
 * Result Type Tests - Miscellaneous Methods
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

describe('Result.match', () => {
  it('should call ok branch for ok result', () => {
    const result = Result.ok<number, TestError>(42);

    const value = result.match({
      ok: (v) => `Value: ${v}`,
      err: (e) => `Error: ${e.message}`
    });

    expect(value).toBe('Value: 42');
  });

  it('should call err branch for err result', () => {
    const error = new TestError('failed', {});
    const result = Result.error<number, TestError>(error);

    const value = result.match({
      ok: (v) => `Value: ${v}`,
      err: (e) => `Error: ${e.message}`
    });

    expect(value).toBe('Error: failed');
  });

  it('should enforce exhaustive handling', () => {
    const result = Result.ok<number, TestError>(42);

    const output: string = result.match({
      ok: (v) => 'ok',
      err: (e) => 'err'
    });

    expect(typeof output).toBe('string');
  });
});

describe('Result.mapError', () => {
  it('should transform error type', () => {
    const error = new TestError('test error', {});
    const result = Result.error<number, TestError>(error);

    const mapped = result.mapError((e) => new Error(e.message));

    expect(mapped.isErr()).toBe(true);
    expect(() => mapped.unwrap()).toThrowError('test error');
  });

  it('should preserve ok result', () => {
    const result = Result.ok<number, TestError>(42);
    const mapped = result.mapError((e) => new Error(e.message));

    expect(mapped.unwrap()).toBe(42);
  });
});

describe('Result Chaining Examples', () => {
  it('should support complex workflow', () => {
    const parse = (s: string): Result<number, TestError> => {
      const n = Number.parseInt(s, 10);
      if (Number.isNaN(n)) {
        return Result.error(new TestError('NaN', { input: s }));
      }
      return Result.ok(n);
    };

    const validate = (n: number): Result<number, TestError> => {
      if (n < 0) {
        return Result.error(new TestError('Negative', { value: n }));
      }
      return Result.ok(n);
    };

    const double = (n: number): Result<number, TestError> => {
      return Result.ok(n * 2);
    };

    const result = Result.ok<string, TestError>('21')
      .andThen(parse)
      .andThen(validate)
      .andThen(double);

    expect(result.unwrap()).toBe(42);
  });

  it('should handle error in workflow', () => {
    const parse = (s: string): Result<number, TestError> => {
      const n = Number.parseInt(s, 10);
      if (Number.isNaN(n)) {
        return Result.error(new TestError('NaN', { input: s }));
      }
      return Result.ok(n);
    };

    const result = Result.ok<string, TestError>('invalid')
      .andThen(parse)
      .map((n) => n * 2);

    expect(result.isErr()).toBe(true);
    expect(result.match({
      ok: () => 'should not happen',
      err: (e) => e.message
    })).toBe('NaN');
  });
});
