import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrganizationService } from './organization.service';
import { clickhouseClient } from '../clickhouse';

// Mock clickhouse client
vi.mock('../clickhouse', () => ({
  clickhouseClient: {
    query: vi.fn()
  }
}));

describe('OrganizationService', () => {
  let service: OrganizationService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new OrganizationService(clickhouseClient as any);
  });

  describe('search', () => {
    it('should call clickhouse with correct parameters when summary is ready', async () => {
      (clickhouseClient.query as any).mockImplementation(async (opts: { query: string }) => {
        const q = opts.query;
        if (q.includes('SELECT 1 FROM financial_reports_summary LIMIT 1')) {
          return { json: vi.fn().mockResolvedValue([{ 1: 1 }]) };
        }
        if (q.includes('count()')) {
          return { json: vi.fn().mockResolvedValue([{ total: '1' }]) };
        }
        return { json: vi.fn().mockResolvedValue([{ inn: '123', name: 'Test Org' }]) };
      });

      const response = await service.search({ search: 'test', page: 1, limit: 10 });

      expect(clickhouseClient.query).toHaveBeenCalledTimes(4); // probe + column check + count + main
      expect(response.data).toHaveLength(1);
      expect(response.pagination?.total).toBe(1);
      expect(response.data[0].inn).toBe('123');
      expect(response.error).toBeUndefined();
    });

    it('should handle numeric search (INN/OGRN) specifically', async () => {
      (clickhouseClient.query as any).mockImplementation(async (opts: { query: string }) => {
        const q = opts.query;
        if (q.includes('SELECT 1 FROM financial_reports_summary LIMIT 1')) {
          return { json: vi.fn().mockResolvedValue([{ 1: 1 }]) };
        }
        if (q.includes('count()')) {
          return { json: vi.fn().mockResolvedValue([{ total: '0' }]) };
        }
        return { json: vi.fn().mockResolvedValue([]) };
      });

      await service.search({ search: '7712345678' });

      const calls = (clickhouseClient.query as any).mock.calls as { 0: { query: string } }[];
      const mainQuery = calls.find((c) => {
        const opts = c[0] as { query?: string };
        return opts?.query?.includes('financial_reports_summary') && !opts?.query?.includes('count()') && !opts?.query?.includes('LIMIT 1');
      });
      expect(mainQuery).toBeDefined();
      const query = (mainQuery![0] as { query: string }).query;
      expect(query).toContain('inn = {search: String}');
      expect(query).toContain('ogrn = {search: String}');
    });

    it('should return empty data with error when summary is missing', async () => {
      (clickhouseClient.query as any).mockResolvedValue({ json: vi.fn().mockResolvedValue([]) });

      const response = await service.search({ search: 'test', page: 1, limit: 10 });

      expect(clickhouseClient.query).toHaveBeenCalledTimes(2); // probe + column check
      expect(response.data).toEqual([]);
      expect(response.pagination?.total).toBe(0);
      expect(response.error).toContain('Кэш не готов');
    });

    it('should return empty data with error when summary table does not exist', async () => {
      (clickhouseClient.query as any).mockRejectedValueOnce(new Error('Table does not exist'));

      const response = await service.search({ search: 'test', page: 1, limit: 10 });

      expect(response.data).toEqual([]);
      expect(response.pagination?.total).toBe(0);
      expect(response.error).toBeDefined();
    });
  });

  describe('getById', () => {
    it('should fetch organization data and connections', async () => {
      const mockFinancials = { json: vi.fn().mockResolvedValue([{ inn: '123', year: 2023 }]) };
      const mockMeta = { json: vi.fn().mockResolvedValue([{ inn: '123', director: 'John Doe', founders: ['Alice'] }]) };
      const mockConnections = { json: vi.fn().mockResolvedValue([{ inn: '456', name: 'Linked Corp' }]) };

      (clickhouseClient.query as any)
        .mockResolvedValueOnce(mockFinancials)
        .mockResolvedValueOnce(mockMeta)
        .mockResolvedValueOnce(mockConnections);

      const result = await service.getById('123');

      expect(result.data).toHaveLength(1);
      expect(result.meta?.director).toBe('John Doe');
      expect(result.connections).toHaveLength(1);
    });
  });
});
