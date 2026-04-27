"use strict";
/**
 * Retry Policy Tests
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const retry_1 = require("../retry");
(0, vitest_1.describe)('RetryPolicy', () => {
    (0, vitest_1.it)('повторяет при ошибке до maxAttempts', async () => {
        const retry = new retry_1.RetryPolicy({
            maxAttempts: 3,
            baseDelay: 10,
            maxDelay: 100,
            strategy: 'constant',
            multiplier: 1,
            jitter: 0
        });
        let attempts = 0;
        const failingFn = async () => {
            attempts++;
            throw new Error('Failed');
        };
        const result = await retry.execute(failingFn);
        (0, vitest_1.expect)(result.success).toBe(false);
        (0, vitest_1.expect)(result.attempts).toBe(3);
        (0, vitest_1.expect)(attempts).toBe(3);
    });
    (0, vitest_1.it)('возвращает успех при первой удачной попытке', async () => {
        const retry = new retry_1.RetryPolicy({
            maxAttempts: 3,
            baseDelay: 10,
            maxDelay: 100,
            strategy: 'constant',
            multiplier: 1,
            jitter: 0
        });
        let attempts = 0;
        const fn = async () => {
            attempts++;
            if (attempts < 2)
                throw new Error('Failed');
            return 'success';
        };
        const result = await retry.execute(fn);
        (0, vitest_1.expect)(result.success).toBe(true);
        if (result.success) {
            (0, vitest_1.expect)(result.value).toBe('success');
            (0, vitest_1.expect)(result.attempts).toBe(2);
        }
    });
    (0, vitest_1.it)('использует exponential backoff', async () => {
        const delays = [];
        const retry = new retry_1.RetryPolicy({
            maxAttempts: 4,
            baseDelay: 100,
            maxDelay: 10000,
            strategy: 'exponential',
            multiplier: 2,
            jitter: 0
        }, undefined);
        // Подменяем sleep метод
        retry['sleep'] = async (ms) => {
            delays.push(ms);
        };
        let attempts = 0;
        const failingFn = async () => {
            attempts++;
            throw new Error('Failed');
        };
        await retry.execute(failingFn);
        // exponential: 100, 200, 400
        (0, vitest_1.expect)(delays).toEqual([100, 200, 400]);
    });
    (0, vitest_1.it)('уважает maxDelay', async () => {
        const delays = [];
        const retry = new retry_1.RetryPolicy({
            maxAttempts: 5,
            baseDelay: 1000,
            maxDelay: 1500,
            strategy: 'exponential',
            multiplier: 4,
            jitter: 0
        });
        retry['sleep'] = async (ms) => {
            delays.push(ms);
        };
        const failingFn = async () => {
            throw new Error('Failed');
        };
        await retry.execute(failingFn);
        // exponential: 1000, 4000->1500, 16000->1500, ...
        delays.forEach(d => (0, vitest_1.expect)(d).toBeLessThanOrEqual(1500));
    });
    (0, vitest_1.it)('передаёт контекст попытки в функцию', async () => {
        const retry = new retry_1.RetryPolicy({
            maxAttempts: 3,
            baseDelay: 10,
            maxDelay: 100,
            strategy: 'constant',
            multiplier: 1,
            jitter: 0
        });
        const contexts = [];
        const fn = async (ctx) => {
            contexts.push({ attempt: ctx.attempt, totalAttempts: ctx.totalAttempts });
            throw new Error('Failed');
        };
        await retry.execute(fn);
        (0, vitest_1.expect)(contexts).toHaveLength(3);
        (0, vitest_1.expect)(contexts[0]).toEqual({ attempt: 1, totalAttempts: 3 });
        (0, vitest_1.expect)(contexts[1]).toEqual({ attempt: 2, totalAttempts: 3 });
        (0, vitest_1.expect)(contexts[2]).toEqual({ attempt: 3, totalAttempts: 3 });
    });
    (0, vitest_1.it)('применяет jitter для разброса задержек', async () => {
        const delays = [];
        const random = vitest_1.vi.fn(() => 0.5);
        const retry = new retry_1.RetryPolicy({
            maxAttempts: 2,
            baseDelay: 100,
            maxDelay: 1000,
            strategy: 'constant',
            multiplier: 1,
            jitter: 0.2
        }, random);
        retry['sleep'] = async (ms) => {
            delays.push(ms);
        };
        const failingFn = async () => {
            throw new Error('Failed');
        };
        await retry.execute(failingFn);
        // 100 ± (0.5 - 0.5) * 2 * 20 = 100
        (0, vitest_1.expect)(delays[0]).toBe(100);
    });
    (0, vitest_1.it)('создаёт новую политику через withConfig', () => {
        const retry = new retry_1.RetryPolicy({
            maxAttempts: 3,
            baseDelay: 100,
            maxDelay: 1000,
            strategy: 'constant',
            multiplier: 1,
            jitter: 0
        });
        const modified = retry.withConfig({ maxAttempts: 5 });
        (0, vitest_1.expect)(modified.config.maxAttempts).toBe(5);
        (0, vitest_1.expect)(modified.config.baseDelay).toBe(100); // неизменное
    });
    (0, vitest_1.describe)('RetryStrategies', () => {
        (0, vitest_1.it)('имеет предопределённые стратегии', () => {
            (0, vitest_1.expect)(retry_1.RetryStrategies.fast).toBeInstanceOf(retry_1.RetryPolicy);
            (0, vitest_1.expect)(retry_1.RetryStrategies.standard).toBeInstanceOf(retry_1.RetryPolicy);
            (0, vitest_1.expect)(retry_1.RetryStrategies.slow).toBeInstanceOf(retry_1.RetryPolicy);
            (0, vitest_1.expect)(retry_1.RetryStrategies.linear).toBeInstanceOf(retry_1.RetryPolicy);
        });
        (0, vitest_1.it)('fast стратегия имеет короткие задержки', () => {
            (0, vitest_1.expect)(retry_1.RetryStrategies.fast.config.baseDelay).toBe(100);
            (0, vitest_1.expect)(retry_1.RetryStrategies.fast.config.maxDelay).toBe(1000);
        });
        (0, vitest_1.it)('slow стратегия имеет длинные задержки', () => {
            (0, vitest_1.expect)(retry_1.RetryStrategies.slow.config.baseDelay).toBe(2000);
            (0, vitest_1.expect)(retry_1.RetryStrategies.slow.config.maxDelay).toBe(30000);
        });
    });
});
