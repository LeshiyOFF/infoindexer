/**
 * ClickHouseSummaryChecker Adapter Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClickHouseSummaryChecker } from '../adapters/clickhouse-summary-checker.adapter';

describe('ClickHouseSummaryChecker', () => {
  let mockClient: any;
  let checker: ClickHouseSummaryChecker;

  beforeEach(() => {
    vi.clearAllMocks();
    mockClient = { query: vi.fn() };
    checker = new ClickHouseSummaryChecker(mockClient);
  });

  describe('check', () => {
    it('should return ready=true when MV and View exist with data', async () => {
      let callCount = 0;
      mockClient.query.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({
            json: () => Promise.resolve([
              { name: 'financial_reports_summary_mv', engine: 'AggregatingMergeTree' },
              { name: 'financial_reports_summary', engine: 'View' }
            ])
          });
        }
        if (callCount === 2) {
          return Promise.resolve({ json: () => Promise.resolve([{ c: '100' }]) });
        }
        return Promise.resolve({ json: () => Promise.resolve([{ c: '1' }]) });
      });

      const result = await checker.check();

      expect(result.mvExists).toBe(true);
      expect(result.viewExists).toBe(true);
      expect(result.rowCount).toBe(100);
      expect(result.hasData).toBe(true);
      expect(result.ready).toBe(true);
    });

    it('should return ready=false when MV does not exist', async () => {
      mockClient.query.mockResolvedValue({
        json: () => Promise.resolve([
          { name: 'financial_reports_summary', engine: 'View' }
        ])
      });

      const result = await checker.check();

      expect(result.mvExists).toBe(false);
      expect(result.viewExists).toBe(true);
      expect(result.ready).toBe(false);
    });

    it('should return ready=false when View does not exist', async () => {
      mockClient.query.mockResolvedValue({
        json: () => Promise.resolve([
          { name: 'financial_reports_summary_mv', engine: 'AggregatingMergeTree' }
        ])
      });

      const result = await checker.check();

      expect(result.mvExists).toBe(true);
      expect(result.viewExists).toBe(false);
      expect(result.ready).toBe(false);
    });

    it('should return rowCount=0 when View is empty', async () => {
      let callCount = 0;
      mockClient.query.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({
            json: () => Promise.resolve([
              { name: 'financial_reports_summary_mv', engine: 'AggregatingMergeTree' },
              { name: 'financial_reports_summary', engine: 'View' }
            ])
          });
        }
        return Promise.resolve({ json: () => Promise.resolve([{ c: '0' }]) });
      });

      const result = await checker.check();

      expect(result.rowCount).toBe(0);
      expect(result.hasData).toBe(false);
      expect(result.ready).toBe(false);
    });

    it('should handle count query error gracefully', async () => {
      let callCount = 0;
      mockClient.query.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({
            json: () => Promise.resolve([
              { name: 'financial_reports_summary_mv', engine: 'AggregatingMergeTree' },
              { name: 'financial_reports_summary', engine: 'View' }
            ])
          });
        }
        return Promise.reject(new Error('Table not ready'));
      });

      const result = await checker.check();

      expect(result.rowCount).toBe(0);
      expect(result.ready).toBe(false);
    });
  });
});
