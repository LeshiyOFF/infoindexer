/**
 * INN Validator Tests
 *
 * @remarks
 * Unit tests for InnValidator.
 * Tests cover valid INN formats (10 and 12 digits).
 *
 * Iteration 13: GDPR Right-to-Delete
 */

import { describe, it, expect } from 'vitest';
import { innValidator } from './inn.validator';
import { InvalidInnError } from '../errors/invalid-inn-error';

describe('InnValidator', () => {
  describe('valid INN (10 digits - legal entity)', () => {
    it('should accept 10-digit INN', () => {
      const result = innValidator.validate('7777777777');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept 10-digit INN with leading zeros', () => {
      const result = innValidator.validate('0000000001');
      expect(result.isValid).toBe(true);
    });
  });

  describe('valid INN (12 digits - individual)', () => {
    it('should accept 12-digit INN', () => {
      const result = innValidator.validate('777777777777');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept 12-digit INN with leading zeros', () => {
      const result = innValidator.validate('000000000001');
      expect(result.isValid).toBe(true);
    });
  });

  describe('invalid INN format', () => {
    it('should reject 9-digit INN', () => {
      const result = innValidator.validate('777777777');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeInstanceOf(InvalidInnError);
    });

    it('should reject 11-digit INN', () => {
      const result = innValidator.validate('77777777777');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeInstanceOf(InvalidInnError);
    });

    it('should reject 13-digit INN', () => {
      const result = innValidator.validate('7777777777777');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeInstanceOf(InvalidInnError);
    });

    it('should reject INN with letters', () => {
      const result = innValidator.validate('777777777a');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeInstanceOf(InvalidInnError);
    });

    it('should reject INN with special characters', () => {
      const result = innValidator.validate('777-777-777');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeInstanceOf(InvalidInnError);
    });

    it('should reject empty string', () => {
      const result = innValidator.validate('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeInstanceOf(InvalidInnError);
    });

    it('should reject null input', () => {
      const result = innValidator.validate(null as unknown as string);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeInstanceOf(InvalidInnError);
    });

    it('should reject undefined input', () => {
      const result = innValidator.validate(undefined as unknown as string);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeInstanceOf(InvalidInnError);
    });
  });

  describe('validateOrThrow', () => {
    it('should not throw for valid INN', () => {
      expect(() => innValidator.validateOrThrow('7777777777')).not.toThrow();
    });

    it('should throw InvalidInnError for invalid INN', () => {
      expect(() => innValidator.validateOrThrow('777777777')).toThrow(InvalidInnError);
    });
  });

  describe('whitespace handling', () => {
    it('should accept trimmed 10-digit INN', () => {
      const result = innValidator.validate('  7777777777  ');
      expect(result.isValid).toBe(true);
    });

    it('should accept trimmed 12-digit INN', () => {
      const result = innValidator.validate('  777777777777  ');
      expect(result.isValid).toBe(true);
    });
  });
});
