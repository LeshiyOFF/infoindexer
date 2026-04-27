import type { CircuitBreakerState } from '../domain/circuit-breaker-state.enum';
export interface ICircuitBreaker {
    /**
     * Выполнить операцию с защитой circuit breaker
     *
     * @param breakerName - Уникальный идентификатор circuit breaker
     * @param operation - Функция для выполнения
     * @returns Результат операции или ошибка если circuit открыт
     * @throws Error если circuit OPEN или операция завершилась с ошибкой
     */
    execute<T>(breakerName: string, operation: () => Promise<T>): Promise<T>;
    /**
     * Получить текущее состояние circuit breaker
     *
     * @param breakerName - Идентификатор circuit breaker
     * @returns Текущее состояние
     */
    getState(breakerName: string): CircuitBreakerState;
    /**
     * Сбросить circuit breaker в состояние CLOSED
     *
     * @param breakerName - Идентификатор circuit breaker
     */
    reset(breakerName: string): void;
    /**
     * Проверить что выполнение разрешено
     *
     * @param breakerName - Идентификатор circuit breaker
     * @returns true если выполнение разрешено, иначе false
     */
    canExecute(breakerName: string): boolean;
}
