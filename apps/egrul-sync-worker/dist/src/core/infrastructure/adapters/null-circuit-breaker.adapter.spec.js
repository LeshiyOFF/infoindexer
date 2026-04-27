"use strict";
/**
 * Спецификация для NullCircuitBreakerAdapter
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const null_circuit_breaker_adapter_1 = require("./null-circuit-breaker.adapter");
(0, vitest_1.describe)('NullCircuitBreakerAdapter', () => {
    let adapter;
    (0, vitest_1.beforeEach)(() => {
        adapter = new null_circuit_breaker_adapter_1.NullCircuitBreakerAdapter('test');
    });
    (0, vitest_1.describe)('execute()', () => {
        (0, vitest_1.it)('should execute function successfully', async () => {
            const fn = () => Promise.resolve('result');
            const result = await adapter.execute(fn);
            (0, vitest_1.expect)(result).toEqual({
                success: true,
                state: 'closed',
                value: 'result'
            });
        });
        (0, vitest_1.it)('should return execution_failed on error', async () => {
            const fn = () => Promise.reject(new Error('Failed'));
            const result = await adapter.execute(fn);
            (0, vitest_1.expect)(result).toEqual({
                success: false,
                state: 'closed',
                error: 'execution_failed'
            });
        });
        (0, vitest_1.it)('should never block requests', async () => {
            const fn = () => Promise.resolve('ok');
            const result = await adapter.execute(fn);
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(adapter.getState()).toBe('closed');
        });
    });
    (0, vitest_1.describe)('executeWithFallback()', () => {
        (0, vitest_1.it)('should return result on success', async () => {
            const fn = () => Promise.resolve('result');
            const fallback = vitest_1.vi.fn().mockResolvedValue('fallback');
            const result = await adapter.executeWithFallback(fn, fallback);
            (0, vitest_1.expect)(result).toBe('result');
            (0, vitest_1.expect)(fallback).not.toHaveBeenCalled();
        });
        (0, vitest_1.it)('should call fallback on error', async () => {
            const fn = () => Promise.reject(new Error('Failed'));
            const fallback = (error) => Promise.resolve(`fallback: ${error}`);
            const result = await adapter.executeWithFallback(fn, fallback);
            (0, vitest_1.expect)(result).toBe('fallback: execution_failed');
        });
    });
    (0, vitest_1.describe)('getState()', () => {
        (0, vitest_1.it)('should always return closed', () => {
            (0, vitest_1.expect)(adapter.getState()).toBe('closed');
        });
    });
    (0, vitest_1.describe)('getStats()', () => {
        (0, vitest_1.it)('should return empty stats', () => {
            const stats = adapter.getStats();
            (0, vitest_1.expect)(stats).toEqual({
                state: 'closed',
                failureCount: 0,
                successCount: 0,
                failuresInWindow: 0,
                lastFailureTime: 0,
                lastStateChange: 0,
                nextAttemptTime: 0
            });
        });
    });
    (0, vitest_1.describe)('reset()', () => {
        (0, vitest_1.it)('should be no-op', () => {
            (0, vitest_1.expect)(() => adapter.reset()).not.toThrow();
            (0, vitest_1.expect)(adapter.getState()).toBe('closed');
        });
    });
    (0, vitest_1.describe)('canProceed()', () => {
        (0, vitest_1.it)('should always return true', () => {
            (0, vitest_1.expect)(adapter.canProceed()).toBe(true);
        });
    });
    (0, vitest_1.describe)('breakerName', () => {
        (0, vitest_1.it)('should use provided name', () => {
            const namedAdapter = new null_circuit_breaker_adapter_1.NullCircuitBreakerAdapter('custom-name');
            (0, vitest_1.expect)(namedAdapter.breakerName).toBe('custom-name');
        });
        (0, vitest_1.it)('should use default name', () => {
            const defaultAdapter = new null_circuit_breaker_adapter_1.NullCircuitBreakerAdapter();
            (0, vitest_1.expect)(defaultAdapter.breakerName).toBe('null');
        });
    });
    (0, vitest_1.describe)('NULL_CIRCUIT_BREAKER singleton', () => {
        (0, vitest_1.it)('should be instance of NullCircuitBreakerAdapter', () => {
            (0, vitest_1.expect)(null_circuit_breaker_adapter_1.NULL_CIRCUIT_BREAKER).toBeInstanceOf(null_circuit_breaker_adapter_1.NullCircuitBreakerAdapter);
        });
        (0, vitest_1.it)('should work like any other instance', async () => {
            const result = await null_circuit_breaker_adapter_1.NULL_CIRCUIT_BREAKER.execute(() => Promise.resolve('ok'));
            (0, vitest_1.expect)(result.success).toBe(true);
        });
        (0, vitest_1.it)('should have default name', () => {
            (0, vitest_1.expect)(null_circuit_breaker_adapter_1.NULL_CIRCUIT_BREAKER.breakerName).toBe('null');
        });
    });
    (0, vitest_1.describe)('zero overhead', () => {
        (0, vitest_1.it)('should execute without delays', async () => {
            const start = Date.now();
            for (let i = 0; i < 1000; i++) {
                await adapter.execute(() => Promise.resolve(i));
            }
            const duration = Date.now() - start;
            // 1000 async operations should be very fast (< 100ms)
            (0, vitest_1.expect)(duration).toBeLessThan(100);
        });
    });
});
