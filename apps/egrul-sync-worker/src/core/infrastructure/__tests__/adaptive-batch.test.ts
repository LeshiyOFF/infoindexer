/**
 * Adaptive Batch Writer Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { AdaptiveBatchWriter, createBatchWriter, DEFAULT_BATCH_CONFIG } from '../adaptive-batch';

describe('AdaptiveBatchWriter', () => {
  it('использует начальный размер батча', async () => {
    const writer = new AdaptiveBatchWriter({
      ...DEFAULT_BATCH_CONFIG,
      initialBatchSize: 50
    });

    expect(writer.batchSize).toBe(50);
  });

  it('увеличивает батч при быстром выполнении', async () => {
    const writer = new AdaptiveBatchWriter({
      ...DEFAULT_BATCH_CONFIG,
      initialBatchSize: 10,
      minBatchSize: 5,
      maxBatchSize: 100,
      targetDuration: 1000,
      growthFactor: 2
    });

    const items = Array.from({ length: 10 }, (_, i) => `item-${i}`);

    await writer.add(items, async () => {
      // Быстрое выполнение
    });

    // После быстрого выполнения батч должен увеличиться
    expect(writer.batchSize).toBeGreaterThan(10);
  });

  it('уменьшает батч при ошибке', async () => {
    const writer = new AdaptiveBatchWriter({
      ...DEFAULT_BATCH_CONFIG,
      initialBatchSize: 100,
      minBatchSize: 10,
      maxBatchSize: 200,
      decayFactor: 0.5
    });

    const items = Array.from({ length: 100 }, (_, i) => `item-${i}`);

    try {
      await writer.add(items, async () => {
        throw new Error('Failed');
      });
    } catch {
      // Ошибка ожидается
    }

    // После ошибки батч должен уменьшиться
    expect(writer.batchSize).toBeLessThan(100);
  });

  it('соблюдает minBatchSize', async () => {
    const writer = new AdaptiveBatchWriter({
      ...DEFAULT_BATCH_CONFIG,
      initialBatchSize: 10,
      minBatchSize: 5,
      maxBatchSize: 100,
      decayFactor: 0.1
    });

    const items = Array.from({ length: 10 }, (_, i) => `item-${i}`);

    for (let i = 0; i < 5; i++) {
      try {
        await writer.add(items, async () => {
          throw new Error('Failed');
        });
      } catch {
        // Ошибка ожидается
      }
    }

    // Не должен опуститься ниже minBatchSize
    expect(writer.batchSize).toBeGreaterThanOrEqual(5);
  });

  it('соблюдает maxBatchSize', async () => {
    const writer = new AdaptiveBatchWriter({
      ...DEFAULT_BATCH_CONFIG,
      initialBatchSize: 10,
      minBatchSize: 5,
      maxBatchSize: 20,
      growthFactor: 10
    });

    const items = Array.from({ length: 10 }, (_, i) => `item-${i}`);

    // Несколько быстрых выполнений
    for (let i = 0; i < 5; i++) {
      await writer.add(items, async () => {
        // Быстрое выполнение
      });
    }

    // Не должен превысить maxBatchSize
    expect(writer.batchSize).toBeLessThanOrEqual(20);
  });

  it('возвращает статистику', async () => {
    const writer = new AdaptiveBatchWriter();

    const items = Array.from({ length: 10 }, (_, i) => `item-${i}`);

    await writer.add(items, async () => {
      // Успешное выполнение
    });

    const stats = writer.getStats();

    expect(stats.currentBatchSize).toBeGreaterThan(0);
    expect(stats.totalProcessed).toBe(10);
    expect(stats.totalBatches).toBe(1);
    expect(stats.successRate).toBe(1);
  });

  it('reset возвращает начальное состояние', async () => {
    const writer = new AdaptiveBatchWriter({
      ...DEFAULT_BATCH_CONFIG,
      initialBatchSize: 100
    });

    const items = Array.from({ length: 100 }, (_, i) => `item-${i}`);

    await writer.add(items, async () => {
      // Выполнение
    });

    expect(writer.batchSize).not.toBe(100);

    writer.reset();

    expect(writer.batchSize).toBe(100);
  });

  it('создаёт типизированный writer через factory', () => {
    const writer = createBatchWriter<string>();

    expect(writer.batchSize).toBe(100); // DEFAULT_BATCH_CONFIG.initialBatchSize
  });

  it('создаёт новый writer через withConfig', () => {
    const writer = new AdaptiveBatchWriter({
      ...DEFAULT_BATCH_CONFIG,
      initialBatchSize: 100
    });

    const modified = writer.withConfig({ maxBatchSize: 500 });

    expect(modified.config.maxBatchSize).toBe(500);
    expect(modified.config.initialBatchSize).toBe(100); // неизменное
  });

  it('обрабатывает пустой массив без ошибок', async () => {
    const writer = new AdaptiveBatchWriter();

    await writer.add([], async () => {
      throw new Error('Should not be called');
    });

    // Не должно быть выполнений
    const stats = writer.getStats();
    expect(stats.totalBatches).toBe(0);
  });
});
