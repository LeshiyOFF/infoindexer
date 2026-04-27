/**
 * Circuit Breaker Result DTO
 *
 * @remarks
 * Data Transfer Object для результата выполнения операции.
 * Следует SRP: только передача результата выполнения.
 *
 * Содержит:
 * - success: успешность выполнения
 * - state: текущее состояние circuit breaker
 * - error: опциональное сообщение об ошибке
 * - timestamp: время создания результата
 *
 * Использует factory методы для создания (OCP).
 */
import { CircuitBreakerState } from './circuit-breaker-state.enum';
export declare class CircuitBreakerResult {
    readonly success: boolean;
    readonly state: CircuitBreakerState;
    readonly error?: string;
    readonly timestamp: number;
    private constructor();
    /**
     * Создать результат успеха
     */
    static success(state: CircuitBreakerState): CircuitBreakerResult;
    /**
     * Создать результат отказа
     */
    static failure(state: CircuitBreakerState, error: string): CircuitBreakerResult;
    /**
     * Создать результат блокировки (circuit open)
     */
    static blocked(state: CircuitBreakerState): CircuitBreakerResult;
}
