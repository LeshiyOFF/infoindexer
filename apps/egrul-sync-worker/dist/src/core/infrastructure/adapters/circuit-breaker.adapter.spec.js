"use strict";
/**
 * Спецификация для CircuitBreakerAdapter
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const circuit_breaker_adapter_1 = require("./circuit-breaker.adapter");
const i_circuit_breaker_port_1 = require("../../ports/i-circuit-breaker.port");
(0, vitest_1.describe)('CircuitBreakerAdapter', () => {
    const mockNow = vitest_1.vi.fn(() => 0);
    const mockMetrics = {
        recordGauge: vitest_1.vi.fn(),
        recordCounter: vitest_1.vi.fn(),
        recordHistogram: vitest_1.vi.fn(),
        recordTiming: vitest_1.vi.fn(),
        recordProgress: vitest_1.vi.fn(),
        recordMemoryMetrics: vitest_1.vi.fn()
    };
    const mockEvents = {
        onStateChange: vitest_1.vi.fn(),
        onFailure: vitest_1.vi.fn(),
        onSuccess: vitest_1.vi.fn(),
        onReset: vitest_1.vi.fn()
    };
    const config = {
        failureThreshold: 3,
        openTimeout: 1000,
        halfOpenTimeout: 500,
        slidingWindowSize: 10000,
        halfOpenMaxCalls: 2,
        successThreshold: 2
    };
    let adapter;
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        mockNow.mockReturnValue(0);
        adapter = new circuit_breaker_adapter_1.CircuitBreakerAdapter('test', config, mockMetrics, mockEvents, mockNow);
    });
    (0, vitest_1.describe)('execute()', () => {
        (0, vitest_1.it)('should execute function successfully', async () => {
            const fn = vitest_1.vi.fn().mockResolvedValue('result');
            const result = await adapter.execute(fn);
            (0, vitest_1.expect)(result).toEqual({
                success: true,
                state: i_circuit_breaker_port_1.CircuitState.CLOSED,
                value: 'result'
            });
            (0, vitest_1.expect)(fn).toHaveBeenCalledTimes(1);
        });
        (0, vitest_1.it)('should open circuit after threshold failures', async () => {
            const failingFn = vitest_1.vi.fn().mockRejectedValue(new Error('Failed'));
            const r1 = await adapter.execute(failingFn);
            const r2 = await adapter.execute(failingFn);
            const r3 = await adapter.execute(failingFn);
            (0, vitest_1.expect)(r1.success).toBe(false);
            if (!r1.success)
                (0, vitest_1.expect)(r1.error).toBe('execution_failed');
            (0, vitest_1.expect)(r2.success).toBe(false);
            if (!r2.success)
                (0, vitest_1.expect)(r2.error).toBe('execution_failed');
            (0, vitest_1.expect)(r3.success).toBe(false);
            if (!r3.success)
                (0, vitest_1.expect)(r3.error).toBe('circuit_open');
            (0, vitest_1.expect)(adapter.getState()).toBe('open');
        });
        (0, vitest_1.it)('should block requests when open', async () => {
            const failingFn = vitest_1.vi.fn().mockRejectedValue(new Error('Failed'));
            // Open the circuit
            await adapter.execute(failingFn);
            await adapter.execute(failingFn);
            await adapter.execute(failingFn);
            // Try again - should be blocked
            const successFn = vitest_1.vi.fn().mockResolvedValue('ok');
            const result = await adapter.execute(successFn);
            (0, vitest_1.expect)(result).toEqual({
                success: false,
                state: 'open',
                error: 'circuit_open'
            });
            (0, vitest_1.expect)(successFn).not.toHaveBeenCalled();
        });
        (0, vitest_1.it)('should transition to half_open after timeout', async () => {
            const failingFn = vitest_1.vi.fn().mockRejectedValue(new Error('Failed'));
            const successFn = vitest_1.vi.fn().mockResolvedValue('ok');
            // Open the circuit
            await adapter.execute(failingFn);
            await adapter.execute(failingFn);
            await adapter.execute(failingFn);
            // Advance time past openTimeout
            mockNow.mockReturnValue(1001);
            const result = await adapter.execute(successFn);
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(adapter.getState()).toBe('half_open');
        });
        (0, vitest_1.it)('should close after successful calls in half_open', async () => {
            const failingFn = vitest_1.vi.fn().mockRejectedValue(new Error('Failed'));
            const successFn = vitest_1.vi.fn().mockResolvedValue('ok');
            // Open the circuit
            await adapter.execute(failingFn);
            await adapter.execute(failingFn);
            await adapter.execute(failingFn);
            // Advance time to half_open
            mockNow.mockReturnValue(1001);
            // Success 1 -> still half_open
            await adapter.execute(successFn);
            (0, vitest_1.expect)(adapter.getState()).toBe('half_open');
            // Success 2 -> closed
            await adapter.execute(successFn);
            (0, vitest_1.expect)(adapter.getState()).toBe('closed');
        });
        (0, vitest_1.it)('should reopen on failure in half_open', async () => {
            const failingFn = vitest_1.vi.fn().mockRejectedValue(new Error('Failed'));
            // Open the circuit
            await adapter.execute(failingFn);
            await adapter.execute(failingFn);
            await adapter.execute(failingFn);
            // Advance time to half_open
            mockNow.mockReturnValue(1001);
            // Fail in half_open -> back to open
            const result = await adapter.execute(failingFn);
            (0, vitest_1.expect)(result.success).toBe(false);
            (0, vitest_1.expect)(adapter.getState()).toBe('open');
        });
    });
    (0, vitest_1.describe)('executeWithFallback()', () => {
        (0, vitest_1.it)('should return result on success', async () => {
            const fn = vitest_1.vi.fn().mockResolvedValue('result');
            const fallback = vitest_1.vi.fn();
            const result = await adapter.executeWithFallback(fn, fallback);
            (0, vitest_1.expect)(result).toBe('result');
            (0, vitest_1.expect)(fallback).not.toHaveBeenCalled();
        });
        (0, vitest_1.it)('should call fallback on circuit_open', async () => {
            const failingFn = vitest_1.vi.fn().mockRejectedValue(new Error('Failed'));
            const fallback = vitest_1.vi.fn().mockResolvedValue('fallback');
            // Open the circuit
            await adapter.execute(failingFn);
            await adapter.execute(failingFn);
            await adapter.execute(failingFn);
            const result = await adapter.executeWithFallback(vitest_1.vi.fn().mockResolvedValue('ok'), fallback);
            (0, vitest_1.expect)(result).toBe('fallback');
            (0, vitest_1.expect)(fallback).toHaveBeenCalledWith('circuit_open');
        });
        (0, vitest_1.it)('should call fallback on execution_failed', async () => {
            const fallback = vitest_1.vi.fn().mockResolvedValue('fallback');
            const result = await adapter.executeWithFallback(vitest_1.vi.fn().mockRejectedValue(new Error('Failed')), fallback);
            (0, vitest_1.expect)(result).toBe('fallback');
            (0, vitest_1.expect)(fallback).toHaveBeenCalledWith('execution_failed');
        });
    });
    (0, vitest_1.describe)('getState()', () => {
        (0, vitest_1.it)('should return closed initially', () => {
            (0, vitest_1.expect)(adapter.getState()).toBe('closed');
        });
        (0, vitest_1.it)('should return open after threshold', async () => {
            const failingFn = vitest_1.vi.fn().mockRejectedValue(new Error('Failed'));
            await adapter.execute(failingFn);
            await adapter.execute(failingFn);
            await adapter.execute(failingFn);
            (0, vitest_1.expect)(adapter.getState()).toBe('open');
        });
    });
    (0, vitest_1.describe)('getStats()', () => {
        (0, vitest_1.it)('should return stats', () => {
            const stats = adapter.getStats();
            (0, vitest_1.expect)(stats).toHaveProperty('state');
            (0, vitest_1.expect)(stats).toHaveProperty('failureCount');
            (0, vitest_1.expect)(stats).toHaveProperty('successCount');
            (0, vitest_1.expect)(stats).toHaveProperty('failuresInWindow');
            (0, vitest_1.expect)(stats).toHaveProperty('lastFailureTime');
            (0, vitest_1.expect)(stats).toHaveProperty('lastStateChange');
            (0, vitest_1.expect)(stats).toHaveProperty('nextAttemptTime');
        });
        (0, vitest_1.it)('should track failures', async () => {
            const failingFn = vitest_1.vi.fn().mockRejectedValue(new Error('Failed'));
            await adapter.execute(failingFn);
            await adapter.execute(failingFn);
            const stats = adapter.getStats();
            (0, vitest_1.expect)(stats.failureCount).toBe(2);
            (0, vitest_1.expect)(stats.failuresInWindow).toBe(2);
        });
    });
    (0, vitest_1.describe)('reset()', () => {
        (0, vitest_1.it)('should reset to closed', async () => {
            const failingFn = vitest_1.vi.fn().mockRejectedValue(new Error('Failed'));
            await adapter.execute(failingFn);
            await adapter.execute(failingFn);
            await adapter.execute(failingFn);
            (0, vitest_1.expect)(adapter.getState()).toBe('open');
            adapter.reset();
            (0, vitest_1.expect)(adapter.getState()).toBe('closed');
            const stats = adapter.getStats();
            (0, vitest_1.expect)(stats.failureCount).toBe(0);
        });
        (0, vitest_1.it)('should emit reset event', async () => {
            const failingFn = vitest_1.vi.fn().mockRejectedValue(new Error('Failed'));
            await adapter.execute(failingFn);
            await adapter.execute(failingFn);
            await adapter.execute(failingFn);
            adapter.reset();
            (0, vitest_1.expect)(mockEvents.onReset).toHaveBeenCalled();
        });
    });
    (0, vitest_1.describe)('canProceed()', () => {
        (0, vitest_1.it)('should return true when closed', () => {
            (0, vitest_1.expect)(adapter.canProceed()).toBe(true);
        });
        (0, vitest_1.it)('should return false when open', async () => {
            const failingFn = vitest_1.vi.fn().mockRejectedValue(new Error('Failed'));
            await adapter.execute(failingFn);
            await adapter.execute(failingFn);
            await adapter.execute(failingFn);
            (0, vitest_1.expect)(adapter.canProceed()).toBe(false);
        });
        (0, vitest_1.it)('should return true after timeout', async () => {
            const failingFn = vitest_1.vi.fn().mockRejectedValue(new Error('Failed'));
            await adapter.execute(failingFn);
            await adapter.execute(failingFn);
            await adapter.execute(failingFn);
            mockNow.mockReturnValue(1001);
            (0, vitest_1.expect)(adapter.canProceed()).toBe(true);
        });
    });
    (0, vitest_1.describe)('metrics integration', () => {
        (0, vitest_1.it)('should record success metric', async () => {
            adapter.reset();
            await adapter.execute(vitest_1.vi.fn().mockResolvedValue('ok'));
            (0, vitest_1.expect)(mockMetrics.recordCounter).toHaveBeenCalledWith('circuit.success', 1, { circuit: 'test' });
        });
        (0, vitest_1.it)('should record failure metric', async () => {
            adapter.reset();
            await adapter.execute(vitest_1.vi.fn().mockRejectedValue(new Error('Failed')));
            (0, vitest_1.expect)(mockMetrics.recordCounter).toHaveBeenCalledWith('circuit.failure', 1, { circuit: 'test', error: 'Error' });
        });
        (0, vitest_1.it)('should record blocked metric', async () => {
            adapter.reset();
            const failingFn = vitest_1.vi.fn().mockRejectedValue(new Error('Failed'));
            await adapter.execute(failingFn);
            await adapter.execute(failingFn);
            await adapter.execute(failingFn);
            await adapter.execute(vitest_1.vi.fn().mockResolvedValue('ok'));
            (0, vitest_1.expect)(mockMetrics.recordCounter).toHaveBeenCalledWith('circuit.blocked', 1, { circuit: 'test' });
        });
    });
    (0, vitest_1.describe)('events integration', () => {
        (0, vitest_1.it)('should emit success event', async () => {
            adapter.reset();
            await adapter.execute(vitest_1.vi.fn().mockResolvedValue('ok'));
            (0, vitest_1.expect)(mockEvents.onSuccess).toHaveBeenCalledWith({
                breakerName: 'test',
                state: i_circuit_breaker_port_1.CircuitState.CLOSED,
                timestamp: 0,
                successCount: 1
            });
        });
        (0, vitest_1.it)('should emit failure event', async () => {
            adapter.reset();
            const error = new Error('Failed');
            await adapter.execute(vitest_1.vi.fn().mockRejectedValue(error));
            (0, vitest_1.expect)(mockEvents.onFailure).toHaveBeenCalledWith({
                breakerName: 'test',
                state: i_circuit_breaker_port_1.CircuitState.CLOSED,
                error,
                timestamp: 0,
                failureCount: 1,
                failuresInWindow: 1
            });
        });
    });
    (0, vitest_1.describe)('without metrics and events', () => {
        (0, vitest_1.it)('should work without metrics', async () => {
            const noMetricsAdapter = new circuit_breaker_adapter_1.CircuitBreakerAdapter('test', config);
            const result = await noMetricsAdapter.execute(vitest_1.vi.fn().mockResolvedValue('ok'));
            (0, vitest_1.expect)(result.success).toBe(true);
        });
        (0, vitest_1.it)('should work without events', async () => {
            const noEventsAdapter = new circuit_breaker_adapter_1.CircuitBreakerAdapter('test', config, mockMetrics);
            const result = await noEventsAdapter.execute(vitest_1.vi.fn().mockResolvedValue('ok'));
            (0, vitest_1.expect)(result.success).toBe(true);
        });
        (0, vitest_1.it)('should work with neither', async () => {
            const minimalAdapter = new circuit_breaker_adapter_1.CircuitBreakerAdapter('test', config);
            const result = await minimalAdapter.execute(vitest_1.vi.fn().mockResolvedValue('ok'));
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(minimalAdapter.getState()).toBe('closed');
        });
    });
});
