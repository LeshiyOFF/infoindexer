/**
 * Спецификация для NullMetricsAdapter
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { NullMetricsAdapter } from './null-metrics.adapter';

describe('NullMetricsAdapter', () => {
  let adapter: NullMetricsAdapter;

  beforeEach(() => {
    adapter = new NullMetricsAdapter();
  });

  describe('recordGauge', () => {
    it('не должен выбрасывать ошибку', () => {
      expect(() => adapter.recordGauge('test', 100)).not.toThrow();
    });

    it('должен принимать любые параметры', () => {
      expect(() => adapter.recordGauge('', NaN, undefined)).not.toThrow();
      expect(() => adapter.recordGauge('test', -1, { a: 'b' })).not.toThrow();
    });
  });

  describe('recordCounter', () => {
    it('не должен выбрасывать ошибку', () => {
      expect(() => adapter.recordCounter('test', 1)).not.toThrow();
    });

    it('должен принимать любые параметры', () => {
      expect(() => adapter.recordCounter('', 0)).not.toThrow();
      expect(() => adapter.recordCounter('test', Infinity, {})).not.toThrow();
    });
  });

  describe('recordHistogram', () => {
    it('не должен выбрасывать ошибку', () => {
      expect(() => adapter.recordHistogram('test', 50)).not.toThrow();
    });

    it('должен принимать любые параметры', () => {
      expect(() => adapter.recordHistogram('', -100)).not.toThrow();
    });
  });

  describe('recordTiming', () => {
    it('не должен выбрасывать ошибку', () => {
      expect(() => adapter.recordTiming('test', 1000)).not.toThrow();
    });

    it('должен принимать любые параметры', () => {
      expect(() => adapter.recordTiming('', -1)).not.toThrow();
      expect(() => adapter.recordTiming('test', 0, { tag: 'value' })).not.toThrow();
    });
  });

  describe('recordProgress', () => {
    it('не должен выбрасывать ошибку', () => {
      expect(() => adapter.recordProgress('test', 50)).not.toThrow();
    });

    it('должен принимать любые параметры', () => {
      expect(() => adapter.recordProgress('', -100)).not.toThrow();
      expect(() => adapter.recordProgress('test', 1000)).not.toThrow();
    });
  });

  describe('recordMemoryMetrics', () => {
    it('не должен выбрасывать ошибку', () => {
      expect(() => adapter.recordMemoryMetrics({})).not.toThrow();
    });

    it('должен принимать любые параметры', () => {
      expect(() => adapter.recordMemoryMetrics({ test: 'value' })).not.toThrow();
    });
  });

  describe('null object behaviour', () => {
    it('все методы должны быть no-op', () => {
      adapter.recordGauge('a', 1);
      adapter.recordCounter('b', 2);
      adapter.recordHistogram('c', 3);
      adapter.recordTiming('d', 4);
      adapter.recordProgress('e', 5);
      adapter.recordMemoryMetrics({});

      // Никаких side effects не происходит
      expect(adapter).toBeDefined();
    });
  });
});
