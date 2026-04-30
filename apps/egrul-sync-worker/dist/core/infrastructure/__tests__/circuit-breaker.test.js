"use strict";
/**
 * Circuit Breaker Tests
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const circuit_breaker_1 = require("../circuit-breaker");
(0, vitest_1.describe)('CircuitBreaker', () => {
    (0, vitest_1.it)('открывает цепь после порога неудач', async () => {
        const breaker = new circuit_breaker_1.CircuitBreaker({
            ...circuit_breaker_1.DEFAULT_CIRCUIT_CONFIG,
            failureThreshold: 3,
            slidingWindowSize: 10000
        }, vitest_1.vi.fn(() => 0));
        const failingFn = async () => {
            throw new Error('Failed');
        };
        // Порог 3 — первые 2 попытки возвращают execution_failed
        const r1 = await breaker.execute(failingFn);
        (0, vitest_1.expect)(r1.success).toBe(false);
        if (!r1.success)
            (0, vitest_1.expect)(r1.error).toBe('execution_failed');
        const r2 = await breaker.execute(failingFn);
        (0, vitest_1.expect)(r2.success).toBe(false);
        if (!r2.success)
            (0, vitest_1.expect)(r2.error).toBe('execution_failed');
        // Третья попытка открывает цепь
        const r3 = await breaker.execute(failingFn);
        (0, vitest_1.expect)(r3.success).toBe(false);
        if (!r3.success)
            (0, vitest_1.expect)(r3.error).toBe('circuit_open');
        (0, vitest_1.expect)(breaker.currentState).toBe(circuit_breaker_1.CircuitState.OPEN);
    });
    (0, vitest_1.it)('блокирует запросы когда цепь открыта', async () => {
        const breaker = new circuit_breaker_1.CircuitBreaker({
            ...circuit_breaker_1.DEFAULT_CIRCUIT_CONFIG,
            failureThreshold: 2,
            openTimeout: 1000
        }, vitest_1.vi.fn(() => 0));
        const failingFn = async () => {
            throw new Error('Failed');
        };
        // Открываем цепь
        await breaker.execute(failingFn);
        await breaker.execute(failingFn);
        // Все последующие запросы блокируются
        const blocked = await breaker.execute(async () => 'success');
        (0, vitest_1.expect)(blocked.success).toBe(false);
        if (!blocked.success) {
            (0, vitest_1.expect)(blocked.error).toBe('circuit_open');
            (0, vitest_1.expect)(blocked.state).toBe(circuit_breaker_1.CircuitState.OPEN);
        }
    });
    (0, vitest_1.it)('переходит в HALF_OPEN после таймаута', async () => {
        let now = 0;
        const breaker = new circuit_breaker_1.CircuitBreaker({
            ...circuit_breaker_1.DEFAULT_CIRCUIT_CONFIG,
            failureThreshold: 2,
            openTimeout: 1000
        }, () => now);
        const failingFn = async () => {
            throw new Error('Failed');
        };
        // Открываем цепь
        await breaker.execute(failingFn);
        await breaker.execute(failingFn);
        (0, vitest_1.expect)(breaker.currentState).toBe(circuit_breaker_1.CircuitState.OPEN);
        // Прошло время openTimeout
        now = 1001;
        const result = await breaker.execute(failingFn);
        // Цепь перешла в HALF_OPEN и запрос был выполнен
        (0, vitest_1.expect)(breaker.currentState).toBe(circuit_breaker_1.CircuitState.OPEN);
    });
    (0, vitest_1.it)('закрывает цепь после успешной попытки в HALF_OPEN', async () => {
        let now = 0;
        const breaker = new circuit_breaker_1.CircuitBreaker({
            ...circuit_breaker_1.DEFAULT_CIRCUIT_CONFIG,
            failureThreshold: 2,
            openTimeout: 1000
        }, () => now);
        const failingFn = async () => {
            throw new Error('Failed');
        };
        const successFn = async () => 'ok';
        // Открываем цепь
        await breaker.execute(failingFn);
        await breaker.execute(failingFn);
        // Переходим в HALF_OPEN
        now = 1001;
        await breaker.execute(successFn);
        (0, vitest_1.expect)(breaker.currentState).toBe(circuit_breaker_1.CircuitState.CLOSED);
    });
    (0, vitest_1.it)('сбрасывает счётчик после успеха', async () => {
        const breaker = new circuit_breaker_1.CircuitBreaker({
            ...circuit_breaker_1.DEFAULT_CIRCUIT_CONFIG,
            failureThreshold: 3
        });
        const failingFn = async () => {
            throw new Error('Failed');
        };
        const successFn = async () => 'ok';
        // Две неудачи
        await breaker.execute(failingFn);
        await breaker.execute(failingFn);
        // Один успех сбрасывает счётчик
        const r = await breaker.execute(successFn);
        (0, vitest_1.expect)(r.success).toBe(true);
        // Нужно ещё 3 неудачи чтобы открыть
        await breaker.execute(failingFn);
        await breaker.execute(failingFn);
        await breaker.execute(failingFn);
        (0, vitest_1.expect)(breaker.currentState).toBe(circuit_breaker_1.CircuitState.OPEN);
    });
    (0, vitest_1.it)('возвращает статистику', () => {
        const breaker = new circuit_breaker_1.CircuitBreaker();
        const stats = breaker.getStats();
        (0, vitest_1.expect)(stats).toHaveProperty('state');
        (0, vitest_1.expect)(stats).toHaveProperty('failureCount');
        (0, vitest_1.expect)(stats).toHaveProperty('successCount');
        (0, vitest_1.expect)(stats).toHaveProperty('failuresInWindow');
    });
    (0, vitest_1.it)('reset возвращает цепь в CLOSED', async () => {
        const breaker = new circuit_breaker_1.CircuitBreaker({
            ...circuit_breaker_1.DEFAULT_CIRCUIT_CONFIG,
            failureThreshold: 2
        });
        const failingFn = async () => {
            throw new Error('Failed');
        };
        await breaker.execute(failingFn);
        await breaker.execute(failingFn);
        (0, vitest_1.expect)(breaker.currentState).toBe(circuit_breaker_1.CircuitState.OPEN);
        breaker.reset();
        (0, vitest_1.expect)(breaker.currentState).toBe(circuit_breaker_1.CircuitState.CLOSED);
    });
});
