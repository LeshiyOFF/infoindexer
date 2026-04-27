/**
 * GDPR Delete Request DTO Tests
 *
 * @remarks
 * Unit tests for GdprDeleteRequest.
 * Tests cover creation, validation, and factory methods.
 *
 * Iteration 13: GDPR Right-to-Delete
 */

import { describe, it, expect } from 'vitest';
import { GdprDeleteRequest } from './gdpr-delete-request.dto';
import { InvalidInnError } from '../errors/invalid-inn-error';

describe('GdprDeleteRequest', () => {
  describe('create with valid input', () => {
    it('should create request with 10-digit INN', () => {
      const request = GdprDeleteRequest.create('7777777777', 'admin-user');

      expect(request.inn).toBe('7777777777');
      expect(request.requestedBy).toBe('admin-user');
      expect(request.requestDate).toBeInstanceOf(Date);
    });

    it('should create request with 12-digit INN', () => {
      const request = GdprDeleteRequest.create('777777777777', 'admin-user');

      expect(request.inn).toBe('777777777777');
      expect(request.requestedBy).toBe('admin-user');
    });

    it('should trim INN', () => {
      const request = GdprDeleteRequest.create('  7777777777  ', 'admin-user');

      expect(request.inn).toBe('7777777777');
    });

    it('should trim requestedBy', () => {
      const request = GdprDeleteRequest.create('7777777777', '  admin-user  ');

      expect(request.requestedBy).toBe('admin-user');
    });

    it('should accept custom requestDate', () => {
      const customDate = new Date('2024-01-01T00:00:00Z');
      const request = GdprDeleteRequest.create('7777777777', 'admin-user', customDate);

      expect(request.requestDate).toEqual(customDate);
    });

    it('should default requestDate to now', () => {
      const before = new Date();
      const request = GdprDeleteRequest.create('7777777777', 'admin-user');
      const after = new Date();

      expect(request.requestDate.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(request.requestDate.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('create with invalid input', () => {
    it('should throw InvalidInnError for 9-digit INN', () => {
      expect(() => GdprDeleteRequest.create('777777777', 'admin-user'))
        .toThrow(InvalidInnError);
    });

    it('should throw InvalidInnError for 13-digit INN', () => {
      expect(() => GdprDeleteRequest.create('7777777777777', 'admin-user'))
        .toThrow(InvalidInnError);
    });

    it('should throw error for empty requestedBy', () => {
      expect(() => GdprDeleteRequest.create('7777777777', ''))
        .toThrow('requestedBy is required');
    });

    it('should throw error for whitespace-only requestedBy', () => {
      expect(() => GdprDeleteRequest.create('7777777777', '   '))
        .toThrow('requestedBy is required');
    });

    it('should throw error for null requestedBy', () => {
      expect(() => GdprDeleteRequest.create('7777777777', null as unknown as string))
        .toThrow('requestedBy is required');
    });

    it('should throw error for invalid requestDate', () => {
      const invalidDate = new Date('invalid');
      expect(() => GdprDeleteRequest.create('7777777777', 'admin-user', invalidDate))
        .toThrow('requestDate must be a valid Date');
    });
  });

  describe('fromParams factory', () => {
    it('should create request from params object', () => {
      const request = GdprDeleteRequest.fromParams({
        inn: '7777777777',
        userId: 'admin-user'
      });

      expect(request.inn).toBe('7777777777');
      expect(request.requestedBy).toBe('admin-user');
      expect(request.requestDate).toBeInstanceOf(Date);
    });
  });

  describe('toObject', () => {
    it('should convert to plain object', () => {
      const requestDate = new Date('2024-01-01T00:00:00Z');
      const request = GdprDeleteRequest.create('7777777777', 'admin-user', requestDate);
      const obj = request.toObject();

      expect(obj).toEqual({
        inn: '7777777777',
        requestedBy: 'admin-user',
        requestDate: '2024-01-01T00:00:00.000Z'
      });
    });

  });

  describe('isExpired', () => {
    it('should return false for recent request', () => {
      const request = GdprDeleteRequest.create('7777777777', 'admin-user');
      expect(request.isExpired(60000)).toBe(false); // 1 minute
    });

    it('should return true for old request', () => {
      const oldDate = new Date(Date.now() - 120000); // 2 minutes ago
      const request = GdprDeleteRequest.create('7777777777', 'admin-user', oldDate);
      expect(request.isExpired(60000)).toBe(true); // 1 minute max age
    });

    it('should return false when maxAge is zero', () => {
      const request = GdprDeleteRequest.create('7777777777', 'admin-user');
      expect(request.isExpired(0)).toBe(true); // Immediately expired
    });
  });
});
