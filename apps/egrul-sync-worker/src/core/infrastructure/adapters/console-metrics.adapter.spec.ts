/**
 * Спецификация для ConsoleMetricsAdapter
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ConsoleMetricsAdapter } from './console-metrics.adapter';

describe('ConsoleMetricsAdapter', () => {
  let adapter: ConsoleMetricsAdapter;
  const logs: string[] = [];

  beforeEach(() => {
    logs.length = 0;
    vi.spyOn(console, 'log').mockImplementation((msg: unknown) => {
      logs.push(String(msg));
    });
    adapter = new ConsoleMetricsAdapter();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('recordGauge', () => {
    it('должен выводить формат [METRIC] 📊 GAUGE name=value', () => {
      adapter.recordGauge('test.metric', 123.45);

      expect(logs).toHaveLength(1);
      const output = logs[0];
      expect(output).toContain('[METRIC]');
      expect(output).toContain('📊');
      expect(output).toContain('GAUGE');
      expect(output).toContain('test.metric=123.45');
    });

    it('должен выводить теги в формате {key:value}', () => {
      adapter.recordGauge('test.metric', 100, { tag1: 'value1', tag2: 'value2' });

      const output = logs[0];
      expect(output).toContain('{tag1:value1,tag2:value2}');
    });

    it('должен работать без тегов', () => {
      adapter.recordGauge('test.metric', 100);

      const output = logs[0];
      expect(output).not.toContain('{');
    });
  });

  describe('recordCounter', () => {
    it('должен выводить формат [METRIC] 🔢 COUNTER name=value', () => {
      adapter.recordCounter('test.counter', 1);

      expect(logs).toHaveLength(1);
      const output = logs[0];
      expect(output).toContain('[METRIC]');
      expect(output).toContain('🔢');
      expect(output).toContain('COUNTER');
      expect(output).toContain('test.counter=1');
    });

    it('должен выводить теги', () => {
      adapter.recordCounter('test.counter', 5, { service: 'worker' });

      const output = logs[0];
      expect(output).toContain('{service:worker}');
    });
  });

  describe('recordHistogram', () => {
    it('должен выводить формат [METRIC] 📈 HISTOGRAM name=value', () => {
      adapter.recordHistogram('test.histogram', 42);

      expect(logs).toHaveLength(1);
      const output = logs[0];
      expect(output).toContain('[METRIC]');
      expect(output).toContain('📈');
      expect(output).toContain('HISTOGRAM');
      expect(output).toContain('test.histogram=42');
    });
  });

  describe('recordTiming', () => {
    it('должен добавлять суффикс _duration_ms', () => {
      adapter.recordTiming('batch_process', 1234);

      const output = logs[0];
      expect(output).toContain('batch_process_duration_ms=1234');
    });

    it('должен использовать иконку таймера', () => {
      adapter.recordTiming('test', 100);

      const output = logs[0];
      expect(output).toContain('⏱️');
    });
  });

  describe('recordProgress', () => {
    it('должен добавлять суффикс _progress_pct', () => {
      adapter.recordProgress('batch', 50);

      const output = logs[0];
      expect(output).toContain('batch_progress_pct=50');
    });

    it('должен clamp значение между 0 и 100', () => {
      adapter.recordProgress('batch', -10);
      expect(logs[0]).toContain('batch_progress_pct=0');

      adapter.recordProgress('batch', 150);
      expect(logs[1]).toContain('batch_progress_pct=100');
    });

    it('должен использовать иконку прогресса', () => {
      adapter.recordProgress('batch', 75);

      const output = logs[0];
      expect(output).toContain('📊');
    });
  });

  describe('recordMemoryMetrics', () => {
    it('должен записывать heap_used_mb', () => {
      adapter.recordMemoryMetrics({ test: 'value' });

      expect(logs.length).toBeGreaterThan(0);
      const output = logs.join(' ');
      expect(output).toContain('memory.heap_used_mb');
    });

    it('должен записывать heap_total_mb', () => {
      adapter.recordMemoryMetrics({});

      const output = logs.join(' ');
      expect(output).toContain('memory.heap_total_mb');
    });

    it('должен записывать rss_mb', () => {
      adapter.recordMemoryMetrics({});

      const output = logs.join(' ');
      expect(output).toContain('memory.rss_mb');
    });
  });

  describe('formatTags (private behaviour)', () => {
    it('должен возвращать пустую строку для undefined', () => {
      adapter.recordGauge('test', 1);

      const output = logs[0];
      expect(output).toMatch(/test=1\s*$/);
    });

    it('должен форматировать один тег', () => {
      adapter.recordGauge('test', 1, { key: 'value' });

      const output = logs[0];
      expect(output).toContain('{key:value}');
    });

    it('должен форматировать несколько тегов', () => {
      adapter.recordGauge('test', 1, { k1: 'v1', k2: 'v2', k3: 'v3' });

      const output = logs[0];
      expect(output).toContain('{k1:v1,k2:v2,k3:v3}');
    });
  });
});
