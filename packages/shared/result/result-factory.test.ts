/**
 * Result Type Tests - Factory Methods
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

describe('Result.ok factory', () => {
  it('should create successful result', () => {
    const result = Result.ok<string, TestError>('success');
    expect(result.isOk()).toBe(true);
    expect(result.isErr()).toBe(false);
  });

  it('should store value', () => {
    const result = Result.ok<number, TestError>(42);
    expect(result.unwrap()).toBe(42);
  });
});

describe('Result.error factory', () => {
  it('should create error result', () => {
    const error = new TestError('failed', {});
    const result = Result.error<string, TestError>(error);
    expect(result.isOk()).toBe(false);
    expect(result.isErr()).toBe(true);
  });

  it('should store error', () => {
    const error = new TestError('failed', {});
    const result = Result.error<string, TestError>(error);

    expect(() => result.unwrap()).toThrowError(TestError);
  });
});
