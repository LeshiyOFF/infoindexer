/**
 * ClickHouseOrganizationById Adapter Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClickHouseOrganizationById } from '../adapters/clickhouse-organization-by-id.adapter';
import type { IConnections } from '../ports/i-connections.port';

describe('ClickHouseOrganizationById', () => {
  let mockClient: any;
  let mockConnections: IConnections;
  let adapter: ClickHouseOrganizationById;

  beforeEach(() => {
    vi.clearAllMocks();
    mockClient = { query: vi.fn() };
    mockConnections = {
      findByDirectorOrFounders: vi.fn().mockResolvedValue([])
    };
    adapter = new ClickHouseOrganizationById(mockClient, mockConnections);
  });

  describe('findById', () => {
    it('should return organization with summary when data exists', async () => {
      const mockCalls = new Map<string, any>();

      mockClient.query.mockImplementation(({ query, query_params }: { query: string; query_params?: Record<string, string> }) => {
        const key = query.includes('financial_reports_summary') ? 'summary' :
                   query.includes('financial_reports WHERE') ? 'reports' :
                   query.includes('companies_meta') ? 'meta' :
                   query.includes('company_sanctions') ? 'sanctions' : 'unknown';

        if (!mockCalls.has(key)) {
          mockCalls.set(key, 0);
        }
        mockCalls.set(key, (mockCalls.get(key) || 0) + 1);

        if (key === 'reports') {
          return Promise.resolve({ json: () => Promise.resolve([{ inn: '7727771492', year: 2023 }]) });
        }
        if (key === 'meta') {
          return Promise.resolve({ json: () => Promise.resolve([{ inn: '7727771492', name: 'Test', director: 'Иванов И.И.', founders: [] }]) });
        }
        if (key === 'sanctions') {
          return Promise.resolve({ json: () => Promise.resolve([]) });
        }
        if (key === 'summary') {
          return Promise.resolve({
            json: () => Promise.resolve([{
              inn: '7727771492',
              ogrn: '1027700132195',
              region: 'Москва',
              latest_year: 2023,
              records_count: 5,
              revenue: 1000000,
              net_profit: 50000,
              charter_capital: 10000,
              age: 10,
              okved: '62.01',
              director: 'Иванов И.И.',
              name: 'ООО Тест',
              status: 'ACTIVE'
            }])
          });
        }
        return Promise.resolve({ json: () => Promise.resolve([]) });
      });

      const result = await adapter.findById('7727771492');

      expect(result.summary).not.toBeUndefined();
      expect(result.summary?.inn).toBe('7727771492');
      expect(result.summary?.revenue.amount).toBe(1000000);
    });

    it('should return undefined summary when not found', async () => {
      mockClient.query.mockImplementation(({ query }: { query: string }) => {
        if (query.includes('financial_reports_summary')) {
          return Promise.resolve({ json: () => Promise.resolve([]) });
        }
        return Promise.resolve({ json: () => Promise.resolve([]) });
      });

      const result = await adapter.findById('7727771492');

      expect(result.summary).toBeUndefined();
    });

    it('should handle fetchSummary error gracefully', async () => {
      mockClient.query.mockImplementation(({ query }: { query: string }) => {
        if (query.includes('financial_reports_summary')) {
          return Promise.reject(new Error('Connection lost'));
        }
        return Promise.resolve({ json: () => Promise.resolve([]) });
      });

      const result = await adapter.findById('7727771492');

      expect(result.summary).toBeUndefined();
    });
  });
});
