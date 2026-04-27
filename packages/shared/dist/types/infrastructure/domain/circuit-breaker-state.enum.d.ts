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
export declare enum CircuitBreakerState {
    /** Нормальная работа, все запросы проходят */
    CLOSED = "CLOSED",
    /** Отказ, запросы блокируются */
    OPEN = "OPEN",
    /** Проверка восстановления сервиса */
    HALF_OPEN = "HALF_OPEN"
}
