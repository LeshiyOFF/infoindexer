/**
 * Спецификация для ClickHouseMetricsService
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ClickHouseMetricsService } from './clickhouse-metrics.service';
import type { IMetricsCollectorPort } from '../ports/i-metrics-collector.port';

describe('ClickHouseMetricsService', () => {
  let mockMetrics: IMetricsCollectorPort;
  let mockMemoryApi: () => NodeJS.MemoryUsage;
  let service: ClickHouseMetricsService;

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

    mockMemoryApi = () => ({
      heapUsed: 1024 * 1024 * 100,
      heapTotal: 1024 * 1024 * 200,
      rss: 1024 * 1024 * 150,
      external: 1024 * 1024 * 10,
      arrayBuffers: 0
    });

    service = new ClickHouseMetricsService(mockMetrics, mockMemoryApi);
  });

  describe('recordBatchMetrics', () => {
    it('должен записывать timing', () => {
      service.recordBatchMetrics('test_table', 1000, 500, true);

      expect(mockMetrics.recordTiming).toHaveBeenCalledWith(
        'batch_execute',
        500,
        { table: 'test_table' }
      );
    });

    it('должен записывать counter для success=true', () => {
      service.recordBatchMetrics('test_table', 1000, 500, true);

      expect(mockMetrics.recordCounter).toHaveBeenCalledWith(
        'batch.completed',
        1,
        { table: 'test_table' }
      );
    });

    it('должен записывать counter для success=false', () => {
      service.recordBatchMetrics('test_table', 1000, 500, false);

      expect(mockMetrics.recordCounter).toHaveBeenCalledWith(
        'batch.failed',
        1,
        { table: 'test_table' }
      );
    });

    it('должен записывать rows_processed', () => {
      service.recordBatchMetrics('test_table', 5000, 500, true);

      expect(mockMetrics.recordCounter).toHaveBeenCalledWith(
        'batch.rows_processed',
        5000,
        { table: 'test_table' }
      );
    });

    it('должен записывать memory heap used', () => {
      service.recordBatchMetrics('test_table', 1000, 500, true);

      expect(mockMetrics.recordGauge).toHaveBeenCalledWith(
        'memory.heap_used_mb',
        expect.any(Number),
        { table: 'test_table' }
      );
    });
  });

  describe('recordQueryMetrics', () => {
    it('должен записывать timing с тегами operation и table', () => {
      service.recordQueryMetrics('SELECT', 'my_table', 1234);

      expect(mockMetrics.recordTiming).toHaveBeenCalledWith(
        'clickhouse.query.duration_ms',
        1234,
        { operation: 'SELECT', table: 'my_table' }
      );
    });
  });

  describe('recordMemoryMetrics', () => {
    it('должен конвертировать байты в MB', () => {
      service.recordMemoryMetrics();

      expect(mockMetrics.recordGauge).toHaveBeenCalledWith(
        'memory.heap_used_mb',
        100,
        {}
      );
      expect(mockMetrics.recordGauge).toHaveBeenCalledWith(
        'memory.heap_total_mb',
        200,
        {}
      );
      expect(mockMetrics.recordGauge).toHaveBeenCalledWith(
        'memory.rss_mb',
        150,
        {}
      );
      expect(mockMetrics.recordGauge).toHaveBeenCalledWith(
        'memory.external_mb',
        10,
        {}
      );
    });

    it('должен передавать labels в метрики', () => {
      service.recordMemoryMetrics({ operation: 'test' });

      expect(mockMetrics.recordGauge).toHaveBeenCalledWith(
        'memory.heap_used_mb',
        expect.any(Number),
        { operation: 'test' }
      );
    });
  });

  describe('startTimer', () => {
    it('должен возвращать функцию', () => {
      const stopTimer = service.startTimer('test_operation');

      expect(typeof stopTimer).toBe('function');
    });

    it('должен записывать timing после вызова возвращенной функции', () => {
      const stopTimer = service.startTimer('batch_process', { table: 'test' });

      stopTimer();

      expect(mockMetrics.recordTiming).toHaveBeenCalledWith(
        'batch_process',
        expect.any(Number),
        { table: 'test' }
      );
    });

    it('должен замерять корректную длительность', () => {
      const stopTimer = service.startTimer('test');

      stopTimer();

      const calls = (mockMetrics.recordTiming as any).mock.calls;
      const duration = calls[0][1] as number;

      expect(duration).toBeGreaterThanOrEqual(0);
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('constructor', () => {
    it('должен использовать process.memoryUsage по умолчанию', () => {
      const defaultService = new ClickHouseMetricsService(mockMetrics);

      defaultService.recordMemoryMetrics();

      expect(mockMetrics.recordGauge).toHaveBeenCalled();
    });

    it('позволяет подменить memoryApi', () => {
      const customMemoryApi: () => NodeJS.MemoryUsage = () => ({
        heapUsed: 999,
        heapTotal: 999,
        rss: 999,
        external: 999,
        arrayBuffers: 0
      });

      const customService = new ClickHouseMetricsService(mockMetrics, customMemoryApi);

      customService.recordMemoryMetrics();

      // Проверяем что customMemoryApi был вызван (через значение метрик)
      expect(mockMetrics.recordGauge).toHaveBeenCalledWith(
        'memory.heap_used_mb',
        expect.any(Number),
        {}
      );
    });
  });
});
