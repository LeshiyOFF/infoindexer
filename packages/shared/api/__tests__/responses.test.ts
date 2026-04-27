/**
 * Tests for API Response Types
 */

import { describe, it, expect } from 'vitest';
import {
  apiSuccess,
  apiError,
  apiPaginated,
  ApiErrorCode
} from '../responses';
import type { ApiResponse, Pagination } from '../responses';

describe('ApiResponse', () => {
  describe('apiSuccess', () => {
    it('creates success response', () => {
      const data = { id: '123', name: 'Test' };
      const response = apiSuccess(data);

      expect(response).toEqual({
        success: true,
        data
      });
    });

    it('preserves data structure', () => {
      const complexData = {
        nested: { value: 42 },
        array: [1, 2, 3]
      };
      const response = apiSuccess(complexData);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(complexData);
    });
  });

  describe('apiError', () => {
    it('creates error response', () => {
      const response = apiError('NOT_FOUND', 'Resource not found');

      expect(response.success).toBe(false);
      expect(response.error).toMatchObject({
        code: 'NOT_FOUND',
        message: 'Resource not found'
      });
      expect(response.error.timestamp).toBeDefined();
    });

    it('includes details when provided', () => {
      const details = { field: 'inn', value: 'invalid' };
      const response = apiError('VALIDATION_ERROR', 'Invalid INN', details);

      expect(response.error.details).toEqual(details);
    });

    it('uses standard error codes', () => {
      const codes = [
        ApiErrorCode.BAD_REQUEST,
        ApiErrorCode.NOT_FOUND,
        ApiErrorCode.INTERNAL_ERROR,
        ApiErrorCode.SYNC_ALREADY_RUNNING
      ];

      codes.forEach(code => {
        const response = apiError(code, 'Test error');
        expect(response.error.code).toBe(code);
      });
    });
  });

  describe('apiPaginated', () => {
    it('creates paginated response', () => {
      const items = [{ id: '1' }, { id: '2' }];
      const pagination: Pagination = {
        page: 1,
        pageSize: 10,
        total: 20,
        totalPages: 2
      };

      const response = apiPaginated(items, pagination);

      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data.items).toEqual(items);
        expect(response.data.pagination).toEqual(pagination);
      }
    });

    it('handles empty page', () => {
      const response = apiPaginated([], {
        page: 10,
        pageSize: 10,
        total: 95,
        totalPages: 10
      });

      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data.items).toEqual([]);
      }
    });
  });

  describe('discriminated union', () => {
    it('allows type narrowing', () => {
      const successResponse: ApiResponse<string> = apiSuccess('test');
      const errorResponse: ApiResponse<string> = apiError('ERROR', 'message');

      if (successResponse.success) {
        // TypeScript знает что здесь есть data
        expect(successResponse.data).toBe('test');
      }

      if (!errorResponse.success) {
        // TypeScript знает что здесь есть error
        expect(errorResponse.error.code).toBe('ERROR');
      }
    });
  });
});
