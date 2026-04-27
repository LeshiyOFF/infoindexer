/**
 * Executor для Circuit Breaker
 *
 * @remarks
 * Infrastructure Layer — Executor в Hexagonal Architecture.
 * Выделен в отдельный класс для SRP.
 * Отвечает за логику выполнения функций через Circuit Breaker.
 *
 * Следует SRP: ответственен только за выполнение функций.
 */
import type { CircuitResult, CircuitError } from '../../ports/i-circuit-breaker.port';
import { CircuitStateStorage } from '../adapters/circuit-state-storage';
import { CircuitBreakerEventsEmitter } from './circuit-breaker-events-emitter';
import { CircuitBreakerMetricsRecorder } from './circuit-breaker-metrics-recorder';
/**
 * Executor для Circuit Breaker
 *
 * @remarks
 * Содержит логику выполнения функций с проверкой состояния.
 * Используется CircuitBreakerAdapter для делегирования.
 */
export declare class CircuitBreakerExecutor {
    private readonly breakerName;
    private readonly state;
    private readonly eventsEmitter;
    private readonly metricsRecorder;
    private readonly now;
    constructor(breakerName: string, state: CircuitStateStorage, eventsEmitter: CircuitBreakerEventsEmitter, metricsRecorder: CircuitBreakerMetricsRecorder, now: () => number);
    /**
     * Выполняет функцию с защитой Circuit Breaker
     *
     * @param fn - Функция для выполнения
     * @returns Результат выполнения
     *
     * @remarks
     * - Проверяет состояние перед выполнением
     * - Выполняет функцию если цепь закрыта
     * - Записывает результат/ошибку
     */
    execute<T>(fn: () => Promise<T>): Promise<CircuitResult<T>>;
    /**
     * Выполняет функцию с fallback при ошибке
     *
     * @param fn - Основная функция
     * @param fallback - Fallback функция
     * @returns Результат выполнения или fallback
     *
     * @remarks
     * Если основная функция завершается ошибкой,
     * вызывается fallback с кодом ошибки.
     */
    executeWithFallback<T>(fn: () => Promise<T>, fallback: (error: CircuitError) => Promise<T>): Promise<T>;
    /**
     * Обрабатывает успешное выполнение
     *
     * @param value - Возвращаемое значение
     * @returns Результат с успехом
     *
     * @remarks
     * Записывает успех, проверяет на изменение состояния.
     */
    private handleSuccess;
    /**
     * Обрабатывает неудачное выполнение
     *
     * @param currentTime - Текущее время
     * @param error - Ошибка
     * @returns Результат с ошибкой
     *
     * @remarks
     * Записывает неудачу, проверяет на изменение состояния.
     */
    private handleFailure;
}
