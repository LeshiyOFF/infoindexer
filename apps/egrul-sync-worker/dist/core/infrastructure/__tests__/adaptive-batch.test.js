"use strict";
/**
 * Adaptive Batch Writer Tests
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const adaptive_batch_1 = require("../adaptive-batch");
(0, vitest_1.describe)('AdaptiveBatchWriter', () => {
    (0, vitest_1.it)('использует начальный размер батча', async () => {
        const writer = new adaptive_batch_1.AdaptiveBatchWriter({
            ...adaptive_batch_1.DEFAULT_BATCH_CONFIG,
            initialBatchSize: 50
        });
        (0, vitest_1.expect)(writer.batchSize).toBe(50);
    });
    (0, vitest_1.it)('увеличивает батч при быстром выполнении', async () => {
        const writer = new adaptive_batch_1.AdaptiveBatchWriter({
            ...adaptive_batch_1.DEFAULT_BATCH_CONFIG,
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
        (0, vitest_1.expect)(writer.batchSize).toBeGreaterThan(10);
    });
    (0, vitest_1.it)('уменьшает батч при ошибке', async () => {
        const writer = new adaptive_batch_1.AdaptiveBatchWriter({
            ...adaptive_batch_1.DEFAULT_BATCH_CONFIG,
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
        }
        catch {
            // Ошибка ожидается
        }
        // После ошибки батч должен уменьшиться
        (0, vitest_1.expect)(writer.batchSize).toBeLessThan(100);
    });
    (0, vitest_1.it)('соблюдает minBatchSize', async () => {
        const writer = new adaptive_batch_1.AdaptiveBatchWriter({
            ...adaptive_batch_1.DEFAULT_BATCH_CONFIG,
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
            }
            catch {
                // Ошибка ожидается
            }
        }
        // Не должен опуститься ниже minBatchSize
        (0, vitest_1.expect)(writer.batchSize).toBeGreaterThanOrEqual(5);
    });
    (0, vitest_1.it)('соблюдает maxBatchSize', async () => {
        const writer = new adaptive_batch_1.AdaptiveBatchWriter({
            ...adaptive_batch_1.DEFAULT_BATCH_CONFIG,
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
        (0, vitest_1.expect)(writer.batchSize).toBeLessThanOrEqual(20);
    });
    (0, vitest_1.it)('возвращает статистику', async () => {
        const writer = new adaptive_batch_1.AdaptiveBatchWriter();
        const items = Array.from({ length: 10 }, (_, i) => `item-${i}`);
        await writer.add(items, async () => {
            // Успешное выполнение
        });
        const stats = writer.getStats();
        (0, vitest_1.expect)(stats.currentBatchSize).toBeGreaterThan(0);
        (0, vitest_1.expect)(stats.totalProcessed).toBe(10);
        (0, vitest_1.expect)(stats.totalBatches).toBe(1);
        (0, vitest_1.expect)(stats.successRate).toBe(1);
    });
    (0, vitest_1.it)('reset возвращает начальное состояние', async () => {
        const writer = new adaptive_batch_1.AdaptiveBatchWriter({
            ...adaptive_batch_1.DEFAULT_BATCH_CONFIG,
            initialBatchSize: 100
        });
        const items = Array.from({ length: 100 }, (_, i) => `item-${i}`);
        await writer.add(items, async () => {
            // Выполнение
        });
        (0, vitest_1.expect)(writer.batchSize).not.toBe(100);
        writer.reset();
        (0, vitest_1.expect)(writer.batchSize).toBe(100);
    });
    (0, vitest_1.it)('создаёт типизированный writer через factory', () => {
        const writer = (0, adaptive_batch_1.createBatchWriter)();
        (0, vitest_1.expect)(writer.batchSize).toBe(100); // DEFAULT_BATCH_CONFIG.initialBatchSize
    });
    (0, vitest_1.it)('создаёт новый writer через withConfig', () => {
        const writer = new adaptive_batch_1.AdaptiveBatchWriter({
            ...adaptive_batch_1.DEFAULT_BATCH_CONFIG,
            initialBatchSize: 100
        });
        const modified = writer.withConfig({ maxBatchSize: 500 });
        (0, vitest_1.expect)(modified.config.maxBatchSize).toBe(500);
        (0, vitest_1.expect)(modified.config.initialBatchSize).toBe(100); // неизменное
    });
    (0, vitest_1.it)('обрабатывает пустой массив без ошибок', async () => {
        const writer = new adaptive_batch_1.AdaptiveBatchWriter();
        await writer.add([], async () => {
            throw new Error('Should not be called');
        });
        // Не должно быть выполнений
        const stats = writer.getStats();
        (0, vitest_1.expect)(stats.totalBatches).toBe(0);
    });
});
