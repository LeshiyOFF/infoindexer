/**
 * Emitter для событий Circuit Breaker
 *
 * @remarks
 * Infrastructure Layer — Event Emitter в Hexagonal Architecture.
 * Выделен в отдельный класс для SRP.
 * Отвечает только за отправку событий в ICircuitBreakerEventsPort.
 *
 * Следует SRP: ответственен только за emit событий.
 * Следует Observer Pattern: уведомляет подписчиков.
 */
import type { ICircuitBreakerEventsPort } from '../../ports/i-circuit-breaker-events.port';
import { CircuitState } from '../../ports/i-circuit-breaker.port';
/**
 * Emitter для событий Circuit Breaker
 *
 * @remarks
 * Обёртка над ICircuitBreakerEventsPort для удобного использования.
 * Все методы optional — если handler не реализует метод, ничего не происходит.
 */
export declare class CircuitBreakerEventsEmitter {
    private readonly events?;
    constructor(events?: ICircuitBreakerEventsPort | undefined);
    /**
     * Отправляет событие изменения состояния
     *
     * @param breakerName - Имя circuit breaker
     * @param previous - Предыдущее состояние
     * @param current - Новое состояние
     * @param timestamp - Время события
     * @param reason - Причина изменения
     */
    emitStateChange(breakerName: string, previous: CircuitState, current: CircuitState, timestamp: number, reason: string): void;
    /**
     * Отправляет событие неудачного выполнения
     *
     * @param breakerName - Имя circuit breaker
     * @param state - Текущее состояние
     * @param error - Ошибка
     * @param timestamp - Время события
     * @param failureCount - Общее количество неудач
     * @param failuresInWindow - Неудач в скользящем окне
     */
    emitFailure(breakerName: string, state: CircuitState, error: Error, timestamp: number, failureCount: number, failuresInWindow: number): void;
    /**
     * Отправляет событие успешного выполнения
     *
     * @param breakerName - Имя circuit breaker
     * @param state - Текущее состояние
     * @param timestamp - Время события
     * @param successCount - Количество успехов подряд
     */
    emitSuccess(breakerName: string, state: CircuitState, timestamp: number, successCount: number): void;
    /**
     * Отправляет событие сброса Circuit Breaker
     *
     * @param breakerName - Имя circuit breaker
     * @param previousState - Состояние до сброса
     * @param timestamp - Время события
     */
    emitReset(breakerName: string, previousState: CircuitState, timestamp: number): void;
    /**
     * Проверяет, есть ли подписчик на события
     *
     * @returns true если events handler установлен
     */
    hasEvents(): boolean;
}
