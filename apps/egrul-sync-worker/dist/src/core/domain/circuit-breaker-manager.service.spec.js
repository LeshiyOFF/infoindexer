"use strict";
/**
 * Спецификация для CircuitBreakerManager
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const circuit_breaker_manager_service_1 = require("./circuit-breaker-manager.service");
const i_circuit_breaker_port_1 = require("../ports/i-circuit-breaker.port");
const circuit_breaker_adapter_1 = require("../infrastructure/adapters/circuit-breaker.adapter");
const circuit_breaker_config_factory_1 = require("./factories/circuit-breaker-config.factory");
(0, vitest_1.describe)('CircuitBreakerManager', () => {
    let manager;
    let mockBreaker;
    (0, vitest_1.beforeEach)(() => {
        manager = new circuit_breaker_manager_service_1.CircuitBreakerManager();
        mockBreaker = {
            execute: vitest_1.vi.fn().mockResolvedValue({
                success: true,
                state: i_circuit_breaker_port_1.CircuitState.CLOSED,
                value: 'ok'
            }),
            executeWithFallback: vitest_1.vi.fn(),
            getState: vitest_1.vi.fn().mockReturnValue(i_circuit_breaker_port_1.CircuitState.CLOSED),
            getStats: vitest_1.vi.fn().mockReturnValue({
                state: i_circuit_breaker_port_1.CircuitState.CLOSED,
                failureCount: 0,
                successCount: 0,
                failuresInWindow: 0,
                lastFailureTime: 0,
                lastStateChange: 0,
                nextAttemptTime: 0
            }),
            reset: vitest_1.vi.fn(),
            canProceed: vitest_1.vi.fn().mockReturnValue(true)
        };
    });
    (0, vitest_1.describe)('registerFactory()', () => {
        (0, vitest_1.it)('should register factory', () => {
            const factory = vitest_1.vi.fn().mockReturnValue(mockBreaker);
            manager.registerFactory('api', factory);
            (0, vitest_1.expect)(manager.has('api')).toBe(true);
        });
        (0, vitest_1.it)('should create breaker on first access', async () => {
            const factory = vitest_1.vi.fn().mockReturnValue(mockBreaker);
            manager.registerFactory('api', factory);
            await manager.execute('api', async () => 'test');
            (0, vitest_1.expect)(factory).toHaveBeenCalledTimes(1);
        });
    });
    (0, vitest_1.describe)('register()', () => {
        (0, vitest_1.it)('should register existing breaker', () => {
            manager.register('direct', mockBreaker);
            (0, vitest_1.expect)(manager.has('direct')).toBe(true);
            (0, vitest_1.expect)(manager.names()).toContain('direct');
        });
        (0, vitest_1.it)('should throw on duplicate registration', () => {
            manager.register('api', mockBreaker);
            (0, vitest_1.expect)(() => manager.register('api', mockBreaker))
                .toThrow('already exists');
        });
    });
    (0, vitest_1.describe)('has()', () => {
        (0, vitest_1.it)('should return false for non-existent breaker', () => {
            (0, vitest_1.expect)(manager.has('nonexistent')).toBe(false);
        });
        (0, vitest_1.it)('should return true for registered factory', () => {
            manager.registerFactory('api', () => mockBreaker);
            (0, vitest_1.expect)(manager.has('api')).toBe(true);
        });
        (0, vitest_1.it)('should return true for registered breaker', () => {
            manager.register('direct', mockBreaker);
            (0, vitest_1.expect)(manager.has('direct')).toBe(true);
        });
    });
    (0, vitest_1.describe)('names()', () => {
        (0, vitest_1.it)('should return empty array initially', () => {
            (0, vitest_1.expect)(manager.names()).toEqual([]);
        });
        (0, vitest_1.it)('should return all registered names', () => {
            manager.register('a', mockBreaker);
            manager.registerFactory('b', () => mockBreaker);
            const names = manager.names();
            (0, vitest_1.expect)(names).toContain('a');
            (0, vitest_1.expect)(names).toContain('b');
        });
    });
    (0, vitest_1.describe)('execute()', () => {
        (0, vitest_1.it)('should execute operation through breaker', async () => {
            manager.register('api', mockBreaker);
            const result = await manager.execute('api', async () => 'test');
            (0, vitest_1.expect)(result.success).toBe(true);
            if (result.success) {
                (0, vitest_1.expect)(result.value).toBe('ok');
            }
            (0, vitest_1.expect)(mockBreaker.execute).toHaveBeenCalledTimes(1);
        });
        (0, vitest_1.it)('should create breaker via factory if needed', async () => {
            const factory = vitest_1.vi.fn().mockReturnValue(mockBreaker);
            manager.registerFactory('api', factory);
            await manager.execute('api', async () => 'test');
            (0, vitest_1.expect)(factory).toHaveBeenCalledTimes(1);
            (0, vitest_1.expect)(mockBreaker.execute).toHaveBeenCalledTimes(1);
        });
        (0, vitest_1.it)('should throw on non-existent breaker', async () => {
            await (0, vitest_1.expect)(manager.execute('nonexistent', async () => 'test'))
                .rejects.toThrow('No circuit breaker or factory');
        });
    });
    (0, vitest_1.describe)('executeWithFallback()', () => {
        (0, vitest_1.it)('should execute with fallback through breaker', async () => {
            const fallback = vitest_1.vi.fn().mockResolvedValue('fallback');
            mockBreaker.executeWithFallback.mockResolvedValue('fallback');
            manager.register('api', mockBreaker);
            const result = await manager.executeWithFallback('api', async () => { throw new Error('fail'); }, fallback);
            (0, vitest_1.expect)(result).toBe('fallback');
            (0, vitest_1.expect)(mockBreaker.executeWithFallback).toHaveBeenCalledTimes(1);
        });
    });
    (0, vitest_1.describe)('getState()', () => {
        (0, vitest_1.it)('should return CLOSED for non-existent breaker', () => {
            (0, vitest_1.expect)(manager.getState('nonexistent')).toBe(i_circuit_breaker_port_1.CircuitState.CLOSED);
        });
        (0, vitest_1.it)('should return breaker state', () => {
            manager.register('api', mockBreaker);
            (0, vitest_1.expect)(manager.getState('api')).toBe(i_circuit_breaker_port_1.CircuitState.CLOSED);
        });
    });
    (0, vitest_1.describe)('getHealth()', () => {
        (0, vitest_1.it)('should return empty health initially', () => {
            const health = manager.getHealth();
            (0, vitest_1.expect)(health.total).toBe(0);
            (0, vitest_1.expect)(health.closed).toBe(0);
            (0, vitest_1.expect)(health.open).toBe(0);
            (0, vitest_1.expect)(health.halfOpen).toBe(0);
        });
        (0, vitest_1.it)('should aggregate breaker health', () => {
            const closedBreaker = {
                execute: vitest_1.vi.fn().mockResolvedValue({ success: true, state: i_circuit_breaker_port_1.CircuitState.CLOSED, value: 'ok' }),
                executeWithFallback: vitest_1.vi.fn(),
                getState: vitest_1.vi.fn().mockReturnValue(i_circuit_breaker_port_1.CircuitState.CLOSED),
                getStats: vitest_1.vi.fn().mockReturnValue({
                    state: i_circuit_breaker_port_1.CircuitState.CLOSED,
                    failureCount: 0,
                    successCount: 0,
                    failuresInWindow: 0,
                    lastFailureTime: 0,
                    lastStateChange: 0,
                    nextAttemptTime: 0
                }),
                reset: vitest_1.vi.fn(),
                canProceed: vitest_1.vi.fn().mockReturnValue(true)
            };
            const openBreaker = {
                execute: vitest_1.vi.fn().mockResolvedValue({ success: true, state: i_circuit_breaker_port_1.CircuitState.CLOSED, value: 'ok' }),
                executeWithFallback: vitest_1.vi.fn(),
                getState: vitest_1.vi.fn().mockReturnValue(i_circuit_breaker_port_1.CircuitState.OPEN),
                getStats: vitest_1.vi.fn().mockReturnValue({
                    state: i_circuit_breaker_port_1.CircuitState.OPEN,
                    failureCount: 5,
                    successCount: 0,
                    failuresInWindow: 5,
                    lastFailureTime: Date.now(),
                    lastStateChange: Date.now(),
                    nextAttemptTime: 0
                }),
                reset: vitest_1.vi.fn(),
                canProceed: vitest_1.vi.fn().mockReturnValue(false)
            };
            manager.register('closed', closedBreaker);
            manager.register('open', openBreaker);
            const health = manager.getHealth();
            (0, vitest_1.expect)(health.total).toBe(2);
            (0, vitest_1.expect)(health.closed).toBe(1);
            (0, vitest_1.expect)(health.open).toBe(1);
        });
    });
    (0, vitest_1.describe)('isAllClosed()', () => {
        (0, vitest_1.it)('should return true when no breakers', () => {
            (0, vitest_1.expect)(manager.isAllClosed()).toBe(true);
        });
        (0, vitest_1.it)('should return true when all closed', () => {
            manager.register('a', mockBreaker);
            manager.register('b', mockBreaker);
            (0, vitest_1.expect)(manager.isAllClosed()).toBe(true);
        });
        (0, vitest_1.it)('should return false when has open breaker', () => {
            const openBreaker = {
                execute: vitest_1.vi.fn().mockResolvedValue({ success: false, state: i_circuit_breaker_port_1.CircuitState.OPEN, error: 'circuit_open' }),
                executeWithFallback: vitest_1.vi.fn(),
                getState: vitest_1.vi.fn().mockReturnValue(i_circuit_breaker_port_1.CircuitState.OPEN),
                getStats: vitest_1.vi.fn().mockReturnValue({
                    state: i_circuit_breaker_port_1.CircuitState.OPEN,
                    failureCount: 5,
                    successCount: 0,
                    failuresInWindow: 5,
                    lastFailureTime: Date.now(),
                    lastStateChange: Date.now(),
                    nextAttemptTime: 0
                }),
                reset: vitest_1.vi.fn(),
                canProceed: vitest_1.vi.fn().mockReturnValue(false)
            };
            manager.register('closed', mockBreaker);
            manager.register('open', openBreaker);
            (0, vitest_1.expect)(manager.isAllClosed()).toBe(false);
        });
    });
    (0, vitest_1.describe)('getOpenBreakers()', () => {
        (0, vitest_1.it)('should return empty array when no breakers', () => {
            (0, vitest_1.expect)(manager.getOpenBreakers()).toEqual([]);
        });
        (0, vitest_1.it)('should return names of open breakers', () => {
            const createOpenBreaker = () => ({
                execute: vitest_1.vi.fn().mockResolvedValue({ success: false, state: i_circuit_breaker_port_1.CircuitState.OPEN, error: 'circuit_open' }),
                executeWithFallback: vitest_1.vi.fn(),
                getState: vitest_1.vi.fn().mockReturnValue(i_circuit_breaker_port_1.CircuitState.OPEN),
                getStats: vitest_1.vi.fn().mockReturnValue({
                    state: i_circuit_breaker_port_1.CircuitState.OPEN,
                    failureCount: 5,
                    successCount: 0,
                    failuresInWindow: 5,
                    lastFailureTime: Date.now(),
                    lastStateChange: Date.now(),
                    nextAttemptTime: 0
                }),
                reset: vitest_1.vi.fn(),
                canProceed: vitest_1.vi.fn().mockReturnValue(false)
            });
            manager.register('closed', mockBreaker);
            manager.register('open1', createOpenBreaker());
            manager.register('open2', createOpenBreaker());
            const open = manager.getOpenBreakers();
            (0, vitest_1.expect)(open).toContain('open1');
            (0, vitest_1.expect)(open).toContain('open2');
            (0, vitest_1.expect)(open).not.toContain('closed');
        });
    });
    (0, vitest_1.describe)('reset()', () => {
        (0, vitest_1.it)('should return false for non-existent breaker', () => {
            (0, vitest_1.expect)(manager.reset('nonexistent')).toBe(false);
        });
        (0, vitest_1.it)('should reset breaker', () => {
            manager.register('api', mockBreaker);
            const result = manager.reset('api');
            (0, vitest_1.expect)(result).toBe(true);
            (0, vitest_1.expect)(mockBreaker.reset).toHaveBeenCalledTimes(1);
        });
    });
    (0, vitest_1.describe)('resetAll()', () => {
        (0, vitest_1.it)('should reset all breakers', () => {
            manager.register('a', mockBreaker);
            manager.register('b', mockBreaker);
            manager.resetAll();
            (0, vitest_1.expect)(mockBreaker.reset).toHaveBeenCalledTimes(2);
        });
    });
    (0, vitest_1.describe)('integration with CircuitBreakerAdapter', () => {
        (0, vitest_1.it)('should work with real adapter', async () => {
            const config = circuit_breaker_config_factory_1.CircuitBreakerConfigFactory.default();
            const adapter = new circuit_breaker_adapter_1.CircuitBreakerAdapter('test', config);
            manager.register('test', adapter);
            // Первое выполнение - успех
            const result1 = await manager.execute('test', async () => 'success');
            (0, vitest_1.expect)(result1.success).toBe(true);
            if (result1.success) {
                (0, vitest_1.expect)(result1.value).toBe('success');
            }
            // Состояние должно быть 'CLOSED'
            (0, vitest_1.expect)(manager.getState('test')).toBe(i_circuit_breaker_port_1.CircuitState.CLOSED);
            // Health check
            const health = manager.getHealth();
            (0, vitest_1.expect)(health.total).toBe(1);
            (0, vitest_1.expect)(health.closed).toBe(1);
        });
        (0, vitest_1.it)('should track failures through manager', async () => {
            const config = circuit_breaker_config_factory_1.CircuitBreakerConfigFactory.forDatabase(); // 3 failures threshold
            const adapter = new circuit_breaker_adapter_1.CircuitBreakerAdapter('db', config);
            manager.register('db', adapter);
            // Три неудачи
            for (let i = 0; i < 3; i++) {
                await manager.execute('db', async () => {
                    throw new Error('Connection failed');
                }).catch(() => undefined);
            }
            // Четвёртая попытка должна быть заблокирована
            const result = await manager.execute('db', async () => 'success');
            (0, vitest_1.expect)(result.success).toBe(false);
            (0, vitest_1.expect)(result.state).toBe(i_circuit_breaker_port_1.CircuitState.OPEN);
            (0, vitest_1.expect)(manager.getState('db')).toBe(i_circuit_breaker_port_1.CircuitState.OPEN);
        });
    });
});
