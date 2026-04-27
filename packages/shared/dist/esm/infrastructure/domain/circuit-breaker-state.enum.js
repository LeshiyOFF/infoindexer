/**
 * Circuit Breaker State Enum
 *
 * @remarks
 * Трёх-state автомат для Circuit Breaker pattern.
 * Следует Single Responsibility: только определение состояний.
 *
 * Состояния:
 * - CLOSED: Нормальная работа, запросы проходят
 * - OPEN: Отказ, запросы блокируются
 * - HALF_OPEN: Проверка восстановления сервиса
 *
 * Переходы состояний:
 * CLOSED → OPEN: достигнут порог отказов
 * OPEN → HALF_OPEN: истекло время ожидания
 * HALF_OPEN → CLOSED: достигнут порог успехов
 * HALF_OPEN → OPEN: произошёл отказ
 *
 * @see https://martinfowler.com/bliki/CircuitBreaker.html
 */
export var CircuitBreakerState;
(function (CircuitBreakerState) {
    /** Нормальная работа, все запросы проходят */
    CircuitBreakerState["CLOSED"] = "CLOSED";
    /** Отказ, запросы блокируются */
    CircuitBreakerState["OPEN"] = "OPEN";
    /** Проверка восстановления сервиса */
    CircuitBreakerState["HALF_OPEN"] = "HALF_OPEN";
})(CircuitBreakerState || (CircuitBreakerState = {}));
