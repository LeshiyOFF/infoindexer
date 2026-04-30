"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreakerEventsEmitter = void 0;
/**
 * Emitter для событий Circuit Breaker
 *
 * @remarks
 * Обёртка над ICircuitBreakerEventsPort для удобного использования.
 * Все методы optional — если handler не реализует метод, ничего не происходит.
 */
class CircuitBreakerEventsEmitter {
    events;
    constructor(events) {
        this.events = events;
    }
    /**
     * Отправляет событие изменения состояния
     *
     * @param breakerName - Имя circuit breaker
     * @param previous - Предыдущее состояние
     * @param current - Новое состояние
     * @param timestamp - Время события
     * @param reason - Причина изменения
     */
    emitStateChange(breakerName, previous, current, timestamp, reason) {
        if (!this.events?.onStateChange) {
            return;
        }
        const event = {
            breakerName,
            previousState: previous,
            newState: current,
            timestamp,
            reason: reason
        };
        this.events.onStateChange(event);
    }
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
    emitFailure(breakerName, state, error, timestamp, failureCount, failuresInWindow) {
        if (!this.events?.onFailure) {
            return;
        }
        const event = {
            breakerName,
            state,
            error,
            timestamp,
            failureCount,
            failuresInWindow
        };
        this.events.onFailure(event);
    }
    /**
     * Отправляет событие успешного выполнения
     *
     * @param breakerName - Имя circuit breaker
     * @param state - Текущее состояние
     * @param timestamp - Время события
     * @param successCount - Количество успехов подряд
     */
    emitSuccess(breakerName, state, timestamp, successCount) {
        if (!this.events?.onSuccess) {
            return;
        }
        const event = {
            breakerName,
            state,
            timestamp,
            successCount
        };
        this.events.onSuccess(event);
    }
    /**
     * Отправляет событие сброса Circuit Breaker
     *
     * @param breakerName - Имя circuit breaker
     * @param previousState - Состояние до сброса
     * @param timestamp - Время события
     */
    emitReset(breakerName, previousState, timestamp) {
        if (!this.events?.onReset) {
            return;
        }
        const event = {
            breakerName,
            previousState,
            timestamp
        };
        this.events.onReset(event);
    }
    /**
     * Проверяет, есть ли подписчик на события
     *
     * @returns true если events handler установлен
     */
    hasEvents() {
        return this.events !== undefined;
    }
}
exports.CircuitBreakerEventsEmitter = CircuitBreakerEventsEmitter;
