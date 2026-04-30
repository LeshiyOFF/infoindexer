/**
 * Recorder для метрик Circuit Breaker
 *
 * @remarks
 * Infrastructure Layer — Metrics Recorder в Hexagonal Architecture.
 * Выделен в отдельный класс для SRP.
 * Отвечает только за запись метрик в IMetricsCollectorPort.
 *
 * Следует SRP: ответственен только за запись метрик.
 * Следует Observer Pattern: записывает метрики при событиях.
 */
import type { IMetricsCollectorPort } from '../../ports/i-metrics-collector.port';
import { CircuitState } from '../../ports/i-circuit-breaker.port';
/**
 * Recorder для метрик Circuit Breaker
 *
 * @remarks
 * Обёртка над IMetricsCollectorPort для записи метрик CB.
 * Все методы безопасны — если metrics не установлен, ничего не происходит.
 */
export declare class CircuitBreakerMetricsRecorder {
    private readonly metrics?;
    constructor(metrics?: IMetricsCollectorPort | undefined);
    /**
     * Записывает метрику изменения состояния
     *
     * @param breakerName - Имя circuit breaker
     * @param state - Новое состояние
     */
    recordStateChange(breakerName: string, state: CircuitState): void;
    /**
     * Записывает метрику успешного выполнения
     *
     * @param breakerName - Имя circuit breaker
     */
    recordSuccess(breakerName: string): void;
    /**
     * Записывает метрику неудачного выполнения
     *
     * @param breakerName - Имя circuit breaker
     * @param error - Ошибка
     */
    recordFailure(breakerName: string, error: Error): void;
    /**
     * Записывает метрику заблокированного запроса
     *
     * @param breakerName - Имя circuit breaker
     */
    recordBlocked(breakerName: string): void;
    /**
     * Записывает метрику сброса
     *
     * @param breakerName - Имя circuit breaker
     */
    recordReset(breakerName: string): void;
    /**
     * Проверяет, есть ли collector метрик
     *
     * @returns true если metrics collector установлен
     */
    hasMetrics(): boolean;
    /**
     * Конвертирует состояние в числовое значение
     *
     * @param state - Состояние circuit breaker
     * @returns Числовое представление
     *
     * @remarks
     * closed = 0, half_open = 0.5, open = 1
     */
    private stateToValue;
}
