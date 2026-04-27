/**
 * Result Type Tests - Unwrap Methods
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

describe('Result.unwrap', () => {
  it('should return value for ok result', () => {
    const result = Result.ok<number, TestError>(42);
    expect(result.unwrap()).toBe(42);
  });

  it('should throw error for err result', () => {
    const error = new TestError('failed', {});
    const result = Result.error<number, TestError>(error);

    expect(() => result.unwrap()).toThrowError('failed');
  });
});

describe('Result.unwrapOr', () => {
  it('should return value for ok result', () => {
    const result = Result.ok<number, TestError>(42);
    expect(result.unwrapOr(0)).toBe(42);
  });

  it('should return default for err result', () => {
    const error = new TestError('failed', {});
    const result = Result.error<number, TestError>(error);
    expect(result.unwrapOr(0)).toBe(0);
  });
});
