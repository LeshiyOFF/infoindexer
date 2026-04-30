"use strict";
/**
 * Спецификация для CircuitBreakerMetricsHandler
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const circuit_breaker_metrics_handler_1 = require("./circuit-breaker-metrics.handler");
const i_circuit_breaker_port_1 = require("../../ports/i-circuit-breaker.port");
(0, vitest_1.describe)('CircuitBreakerMetricsHandler', () => {
    let mockMetrics;
    let handler;
    (0, vitest_1.beforeEach)(() => {
        mockMetrics = {
            recordGauge: vitest_1.vi.fn(),
            recordCounter: vitest_1.vi.fn(),
            recordHistogram: vitest_1.vi.fn(),
            recordTiming: vitest_1.vi.fn(),
            recordProgress: vitest_1.vi.fn(),
            recordMemoryMetrics: vitest_1.vi.fn()
        };
        handler = new circuit_breaker_metrics_handler_1.CircuitBreakerMetricsHandler(mockMetrics);
    });
    (0, vitest_1.describe)('onStateChange()', () => {
        (0, vitest_1.it)('should record state change counter', () => {
            const event = {
                breakerName: 'api',
                previousState: i_circuit_breaker_port_1.CircuitState.CLOSED,
                newState: i_circuit_breaker_port_1.CircuitState.OPEN,
                timestamp: 1000,
                reason: 'threshold_exceeded'
            };
            handler.onStateChange(event);
            (0, vitest_1.expect)(mockMetrics.recordCounter).toHaveBeenCalledWith(circuit_breaker_metrics_handler_1.CIRCUIT_BREAKER_METRICS.STATE_CHANGE, 1, {
                circuit: 'api',
                from: 'closed',
                to: 'open',
                reason: 'threshold_exceeded'
            });
        });
        (0, vitest_1.it)('should record state gauge', () => {
            const event = {
                breakerName: 'api',
                previousState: i_circuit_breaker_port_1.CircuitState.CLOSED,
                newState: i_circuit_breaker_port_1.CircuitState.HALF_OPEN,
                timestamp: 1000,
                reason: 'timeout_elapsed'
            };
            handler.onStateChange(event);
            (0, vitest_1.expect)(mockMetrics.recordGauge).toHaveBeenCalledWith(circuit_breaker_metrics_handler_1.CIRCUIT_BREAKER_METRICS.STATE, 0.5, { circuit: 'api' });
        });
        (0, vitest_1.it)('should record 0 for closed state', () => {
            const event = {
                breakerName: 'api',
                previousState: i_circuit_breaker_port_1.CircuitState.OPEN,
                newState: i_circuit_breaker_port_1.CircuitState.CLOSED,
                timestamp: 1000,
                reason: 'success_threshold'
            };
            handler.onStateChange(event);
            (0, vitest_1.expect)(mockMetrics.recordGauge).toHaveBeenCalledWith(circuit_breaker_metrics_handler_1.CIRCUIT_BREAKER_METRICS.STATE, 0, { circuit: 'api' });
        });
        (0, vitest_1.it)('should record 1 for open state', () => {
            const event = {
                breakerName: 'api',
                previousState: i_circuit_breaker_port_1.CircuitState.CLOSED,
                newState: i_circuit_breaker_port_1.CircuitState.OPEN,
                timestamp: 1000,
                reason: 'threshold_exceeded'
            };
            handler.onStateChange(event);
            (0, vitest_1.expect)(mockMetrics.recordGauge).toHaveBeenCalledWith(circuit_breaker_metrics_handler_1.CIRCUIT_BREAKER_METRICS.STATE, 1, { circuit: 'api' });
        });
    });
    (0, vitest_1.describe)('onFailure()', () => {
        (0, vitest_1.it)('should record failure counter', () => {
            const event = {
                breakerName: 'api',
                state: i_circuit_breaker_port_1.CircuitState.CLOSED,
                error: new Error('Connection failed'),
                timestamp: 1000,
                failureCount: 3,
                failuresInWindow: 3
            };
            handler.onFailure(event);
            (0, vitest_1.expect)(mockMetrics.recordCounter).toHaveBeenCalledWith(circuit_breaker_metrics_handler_1.CIRCUIT_BREAKER_METRICS.FAILURE, 1, {
                circuit: 'api',
                state: 'closed',
                error_type: 'Error'
            });
        });
        (0, vitest_1.it)('should record failure count gauge', () => {
            const event = {
                breakerName: 'api',
                state: i_circuit_breaker_port_1.CircuitState.CLOSED,
                error: new Error('Connection failed'),
                timestamp: 1000,
                failureCount: 5,
                failuresInWindow: 3
            };
            handler.onFailure(event);
            (0, vitest_1.expect)(mockMetrics.recordGauge).toHaveBeenCalledWith(circuit_breaker_metrics_handler_1.CIRCUIT_BREAKER_METRICS.FAILURE_COUNT, 5, { circuit: 'api' });
        });
        (0, vitest_1.it)('should record failures in window gauge', () => {
            const event = {
                breakerName: 'api',
                state: i_circuit_breaker_port_1.CircuitState.CLOSED,
                error: new TypeError('Invalid response'),
                timestamp: 1000,
                failureCount: 5,
                failuresInWindow: 2
            };
            handler.onFailure(event);
            (0, vitest_1.expect)(mockMetrics.recordGauge).toHaveBeenCalledWith(circuit_breaker_metrics_handler_1.CIRCUIT_BREAKER_METRICS.FAILURES_IN_WINDOW, 2, { circuit: 'api' });
        });
    });
    (0, vitest_1.describe)('onSuccess()', () => {
        (0, vitest_1.it)('should record success counter', () => {
            const event = {
                breakerName: 'api',
                state: i_circuit_breaker_port_1.CircuitState.CLOSED,
                timestamp: 1000,
                successCount: 1
            };
            handler.onSuccess(event);
            (0, vitest_1.expect)(mockMetrics.recordCounter).toHaveBeenCalledWith(circuit_breaker_metrics_handler_1.CIRCUIT_BREAKER_METRICS.SUCCESS, 1, {
                circuit: 'api',
                state: 'closed'
            });
        });
        (0, vitest_1.it)('should record success count gauge', () => {
            const event = {
                breakerName: 'api',
                state: i_circuit_breaker_port_1.CircuitState.HALF_OPEN,
                timestamp: 1000,
                successCount: 3
            };
            handler.onSuccess(event);
            (0, vitest_1.expect)(mockMetrics.recordGauge).toHaveBeenCalledWith(circuit_breaker_metrics_handler_1.CIRCUIT_BREAKER_METRICS.SUCCESS_COUNT, 3, { circuit: 'api' });
        });
    });
    (0, vitest_1.describe)('onReset()', () => {
        (0, vitest_1.it)('should record reset counter', () => {
            const event = {
                breakerName: 'api',
                previousState: i_circuit_breaker_port_1.CircuitState.OPEN,
                timestamp: 1000
            };
            handler.onReset(event);
            (0, vitest_1.expect)(mockMetrics.recordCounter).toHaveBeenCalledWith(circuit_breaker_metrics_handler_1.CIRCUIT_BREAKER_METRICS.RESET, 1, {
                circuit: 'api',
                from: 'open'
            });
        });
        (0, vitest_1.it)('should record state as closed (0)', () => {
            const event = {
                breakerName: 'api',
                previousState: i_circuit_breaker_port_1.CircuitState.OPEN,
                timestamp: 1000
            };
            handler.onReset(event);
            (0, vitest_1.expect)(mockMetrics.recordGauge).toHaveBeenCalledWith(circuit_breaker_metrics_handler_1.CIRCUIT_BREAKER_METRICS.STATE, 0, { circuit: 'api' });
        });
    });
    (0, vitest_1.describe)('CIRCUIT_BREAKER_METRICS constants', () => {
        (0, vitest_1.it)('should have all metric names', () => {
            (0, vitest_1.expect)(circuit_breaker_metrics_handler_1.CIRCUIT_BREAKER_METRICS).toMatchObject({
                STATE_CHANGE: 'circuit.state_change',
                STATE: 'circuit.state',
                SUCCESS: 'circuit.success',
                FAILURE: 'circuit.failure',
                BLOCKED: 'circuit.blocked',
                RESET: 'circuit.reset',
                HALF_OPEN_CALLS: 'circuit.half_open_calls',
                FAILURE_COUNT: 'circuit.failure_count',
                SUCCESS_COUNT: 'circuit.success_count',
                FAILURES_IN_WINDOW: 'circuit.failures_in_window',
                LAST_FAILURE_AGE: 'circuit.last_failure_age',
                STATE_DURATION: 'circuit.state_duration'
            });
        });
    });
    (0, vitest_1.describe)('integration', () => {
        (0, vitest_1.it)('should handle all events in sequence', () => {
            // State change
            handler.onStateChange({
                breakerName: 'api',
                previousState: i_circuit_breaker_port_1.CircuitState.CLOSED,
                newState: i_circuit_breaker_port_1.CircuitState.OPEN,
                timestamp: 1000,
                reason: 'threshold_exceeded'
            });
            // Failures
            handler.onFailure({
                breakerName: 'api',
                state: i_circuit_breaker_port_1.CircuitState.OPEN,
                error: new Error('Failed'),
                timestamp: 1000,
                failureCount: 5,
                failuresInWindow: 5
            });
            // Reset
            handler.onReset({
                breakerName: 'api',
                previousState: i_circuit_breaker_port_1.CircuitState.OPEN,
                timestamp: 2000
            });
            // Success
            handler.onSuccess({
                breakerName: 'api',
                state: i_circuit_breaker_port_1.CircuitState.CLOSED,
                timestamp: 2000,
                successCount: 1
            });
            (0, vitest_1.expect)(mockMetrics.recordCounter).toHaveBeenCalledTimes(4);
            (0, vitest_1.expect)(mockMetrics.recordGauge).toHaveBeenCalledTimes(5);
        });
    });
});
