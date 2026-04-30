"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreakerMetricsRecorder = void 0;
const i_circuit_breaker_port_1 = require("../../ports/i-circuit-breaker.port");
/**
 * Recorder для метрик Circuit Breaker
 *
 * @remarks
 * Обёртка над IMetricsCollectorPort для записи метрик CB.
 * Все методы безопасны — если metrics не установлен, ничего не происходит.
 */
class CircuitBreakerMetricsRecorder {
    metrics;
    constructor(metrics) {
        this.metrics = metrics;
    }
    /**
     * Записывает метрику изменения состояния
     *
     * @param breakerName - Имя circuit breaker
     * @param state - Новое состояние
     */
    recordStateChange(breakerName, state) {
        if (!this.metrics) {
            return;
        }
        const stateValue = this.stateToValue(state);
        this.metrics.recordGauge('circuit.state', stateValue, { circuit: breakerName });
    }
    /**
     * Записывает метрику успешного выполнения
     *
     * @param breakerName - Имя circuit breaker
     */
    recordSuccess(breakerName) {
        if (!this.metrics) {
            return;
        }
        this.metrics.recordCounter('circuit.success', 1, { circuit: breakerName });
    }
    /**
     * Записывает метрику неудачного выполнения
     *
     * @param breakerName - Имя circuit breaker
     * @param error - Ошибка
     */
    recordFailure(breakerName, error) {
        if (!this.metrics) {
            return;
        }
        this.metrics.recordCounter('circuit.failure', 1, { circuit: breakerName, error: error.name });
    }
    /**
     * Записывает метрику заблокированного запроса
     *
     * @param breakerName - Имя circuit breaker
     */
    recordBlocked(breakerName) {
        if (!this.metrics) {
            return;
        }
        this.metrics.recordCounter('circuit.blocked', 1, { circuit: breakerName });
    }
    /**
     * Записывает метрику сброса
     *
     * @param breakerName - Имя circuit breaker
     */
    recordReset(breakerName) {
        if (!this.metrics) {
            return;
        }
        this.metrics.recordCounter('circuit.reset', 1, { circuit: breakerName });
    }
    /**
     * Проверяет, есть ли collector метрик
     *
     * @returns true если metrics collector установлен
     */
    hasMetrics() {
        return this.metrics !== undefined;
    }
    /**
     * Конвертирует состояние в числовое значение
     *
     * @param state - Состояние circuit breaker
     * @returns Числовое представление
     *
     * @remarks
     * closed = 0, half_open = 0.5, open = 1
     */
    stateToValue(state) {
        switch (state) {
            case i_circuit_breaker_port_1.CircuitState.CLOSED:
                return 0;
            case i_circuit_breaker_port_1.CircuitState.HALF_OPEN:
                return 0.5;
            case i_circuit_breaker_port_1.CircuitState.OPEN:
                return 1;
        }
    }
}
exports.CircuitBreakerMetricsRecorder = CircuitBreakerMetricsRecorder;
