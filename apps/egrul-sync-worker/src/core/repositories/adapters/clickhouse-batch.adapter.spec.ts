import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ClickHouseBatchAdapter } from './clickhouse-batch.adapter';
import type { BatchConfig } from '../../domain/value-objects/batch-config.vo';
import type { BatchProgress } from '../ports/i-batch-processor.port';
import type { IMetricsCollectorPort } from '../../ports/i-metrics-collector.port';

// Создаём тестовый BatchConfig с малым batch size для unit-тестов
const createTestConfig = (): BatchConfig => ({
  batchSize: 10,
  getBatchCount: (total: number) => Math.ceil(total / 10),
  getOffset: (index: number) => index * 10,
  maxMemoryUsage: 6_000_000_000,
  maxExecutionTime: 120
}) as unknown as BatchConfig;

describe('ClickHouseBatchAdapter', () => {
  const mockClient = {
    command: vi.fn().mockResolvedValue(undefined),
    query: vi.fn()
  };

  let adapter: ClickHouseBatchAdapter;
  let testConfig: BatchConfig;

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new ClickHouseBatchAdapter(mockClient as any);
    testConfig = createTestConfig();
  });

  const mockCount = (cnt: string) => {
    mockClient.query.mockResolvedValue({ json: vi.fn().mockResolvedValue([{ cnt }]) });
  };

  describe('processInBatches', () => {
    it('should process all batches', async () => {
      mockCount('100');
      const result = await adapter.processInBatches('SELECT * FROM test LIMIT {limit} OFFSET {offset}', testConfig);
      expect(result.batchesProcessed).toBe(10);
      expect(result.totalRows).toBe(100);
    });

    it('should report progress after each batch', async () => {
      mockCount('50');
      const cb = vi.fn();
      await adapter.processInBatches('SELECT * FROM test LIMIT {limit} OFFSET {offset}', testConfig, cb);
      expect(cb).toHaveBeenCalledTimes(5);
      expect(cb).toHaveBeenLastCalledWith(expect.objectContaining({ batchIndex: 5, processedRows: 50, percentage: 100 }));
    });

    it('should replace placeholders in query', async () => {
      mockCount('30');
      await adapter.processInBatches('SELECT * FROM test LIMIT {limit:UInt32} OFFSET {offset}', testConfig);
      expect(mockClient.command).toHaveBeenCalledWith(expect.objectContaining({ query: expect.stringContaining('LIMIT 10') }));
    });

    it('should calculate duration', async () => {
      mockCount('20');
      const result = await adapter.processInBatches('SELECT * FROM test', testConfig);
      expect(result.durationMs).toBeGreaterThanOrEqual(0);
    });

    it('should handle partial batches', async () => {
      mockCount('25');
      const result = await adapter.processInBatches('SELECT * FROM test', testConfig);
      expect(result.batchesProcessed).toBe(3);
      expect(result.totalRows).toBe(25);
    });
  });

  describe('getTotalRows', () => {
    it('should extract table name and count rows', async () => {
      mockCount('12345');
      await adapter.processInBatches('SELECT * FROM egrul_persons_raw LIMIT {limit} OFFSET {offset}', testConfig);
      expect(mockClient.query).toHaveBeenCalledWith(expect.objectContaining({ query: 'SELECT count() as cnt FROM egrul_persons_raw' }));
    });

    it('should throw error if FROM clause not found', async () => {
      mockCount('10');
      await expect(adapter.processInBatches('INVALID QUERY', testConfig)).rejects.toThrow('Cannot determine table for row count');
    });
  });

  describe('buildBatchQuery', () => {
    it('should replace limit placeholder', async () => {
      const calls: string[] = [];
      mockClient.command.mockImplementation(({ query }: { query: string }) => { calls.push(query); return Promise.resolve(); });
      mockCount('10');
      await adapter.processInBatches('SELECT * FROM test LIMIT {limit} OFFSET {offset}', testConfig);
      expect(calls[0]).toContain('LIMIT 10');
      expect(calls[0]).not.toContain('{limit}');
    });

    it('should replace offset placeholder', async () => {
      const calls: string[] = [];
      mockClient.command.mockImplementation(({ query }: { query: string }) => { calls.push(query); return Promise.resolve(); });
      mockCount('20');
      await adapter.processInBatches('SELECT * FROM test LIMIT {limit} OFFSET {offset}', testConfig);
      expect(calls[1]).toContain('OFFSET 10');
      expect(calls[1]).not.toContain('{offset}');
    });

    it('should replace UInt32 placeholder with value', async () => {
      const calls: string[] = [];
      mockClient.command.mockImplementation(({ query }: { query: string }) => { calls.push(query); return Promise.resolve(); });
      mockCount('10');
      await adapter.processInBatches('SELECT * FROM test LIMIT {limit:UInt32} OFFSET {offset}', testConfig);
      expect(calls[0]).toContain('LIMIT 10');
      expect(calls[0]).not.toContain('{limit:UInt32}');
    });
  });

  describe('progress tracking', () => {
    it('should provide correct percentage', async () => {
      mockCount('100');
      const progresses: BatchProgress[] = [];
      await adapter.processInBatches('SELECT * FROM test', testConfig, (p) => progresses.push(p));
      expect(progresses[0].percentage).toBeCloseTo(10, 0);
      expect(progresses[4].percentage).toBeCloseTo(50, 0);
      expect(progresses[9].percentage).toBe(100);
    });

    it('should cap percentage at 100', async () => {
      mockCount('15');
      const progresses: BatchProgress[] = [];
      await adapter.processInBatches('SELECT * FROM test', testConfig, (p) => progresses.push(p));
      expect(progresses[progresses.length - 1].percentage).toBeLessThanOrEqual(100);
    });
  });

  describe('metrics integration', () => {
    let mockMetrics: IMetricsCollectorPort;

    beforeEach(() => {
      const recordGaugeFn = vi.fn();
      const recordCounterFn = vi.fn();
      const recordHistogramFn = vi.fn();
      const recordTimingFn = vi.fn();
      const recordProgressFn = vi.fn();
      const recordMemoryMetricsFn = vi.fn();

      mockMetrics = {
        recordGauge: recordGaugeFn,
        recordCounter: recordCounterFn,
        recordHistogram: recordHistogramFn,
        recordTiming: recordTimingFn,
        recordProgress: recordProgressFn,
        recordMemoryMetrics: recordMemoryMetricsFn
      };
    });

    it('should work without metrics (backward compatibility)', async () => {
      mockCount('30');
      const adapterWithoutMetrics = new ClickHouseBatchAdapter(mockClient as any);

      await expect(
        adapterWithoutMetrics.processInBatches('SELECT * FROM test LIMIT {limit} OFFSET {offset}', testConfig)
      ).resolves.toBeDefined();
    });

    it('should record metrics when collector is provided', async () => {
      mockCount('20');
      const adapterWithMetrics = new ClickHouseBatchAdapter(mockClient as any, mockMetrics);

      await adapterWithMetrics.processInBatches('SELECT * FROM test LIMIT {limit} OFFSET {offset}', testConfig);

      expect(mockMetrics.recordTiming).toHaveBeenCalledWith(
        'batch_execute',
        expect.any(Number),
        expect.objectContaining({ table: 'test' })
      );
      expect(mockMetrics.recordCounter).toHaveBeenCalledWith(
        'batch.rows_processed',
        10,
        { table: 'test' }
      );
      expect(mockMetrics.recordProgress).toHaveBeenCalled();
    });

    it('should record error counter on failure', async () => {
      mockCount('10');
      mockClient.command.mockRejectedValueOnce(new Error('Query failed'));
      const adapterWithMetrics = new ClickHouseBatchAdapter(mockClient as any, mockMetrics);

      await expect(
        adapterWithMetrics.processInBatches('SELECT * FROM test LIMIT {limit} OFFSET {offset}', testConfig)
      ).rejects.toThrow();

      expect(mockMetrics.recordCounter).toHaveBeenCalledWith(
        'batch.errors',
        1,
        expect.objectContaining({ table: 'test', error: 'Error' })
      );
    });

    it('should record final metrics on completion', async () => {
      mockCount('30');
      const adapterWithMetrics = new ClickHouseBatchAdapter(mockClient as any, mockMetrics);

      await adapterWithMetrics.processInBatches('SELECT * FROM test LIMIT {limit} OFFSET {offset}', testConfig);

      expect(mockMetrics.recordCounter).toHaveBeenCalledWith(
        'batch.total',
        3,
        { table: 'test', status: 'success' }
      );
      expect(mockMetrics.recordTiming).toHaveBeenCalledWith(
        'batch.total_duration_ms',
        expect.any(Number),
        { table: 'test' }
      );
      expect(mockMetrics.recordMemoryMetrics).toHaveBeenCalledWith(
        expect.objectContaining({ operation: 'batch_complete', table: 'test' })
      );
    });

    it('should extract table name from query', async () => {
      mockCount('10');
      const adapterWithMetrics = new ClickHouseBatchAdapter(mockClient as any, mockMetrics);

      await adapterWithMetrics.processInBatches('SELECT * FROM egrul_persons_raw LIMIT {limit} OFFSET {offset}', testConfig);

      expect(mockMetrics.recordTiming).toHaveBeenCalledWith(
        'batch_execute',
        expect.any(Number),
        { table: 'egrul_persons_raw', batch_index: '0' }
      );
    });
  });
});
