"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreakerResult = void 0;
class CircuitBreakerResult {
    success;
    state;
    error;
    timestamp;
    constructor(success, state, error) {
        this.success = success;
        this.state = state;
        this.error = error;
        this.timestamp = Date.now();
    }
    /**
     * Создать результат успеха
     */
    static success(state) {
        return new CircuitBreakerResult(true, state);
    }
    /**
     * Создать результат отказа
     */
    static failure(state, error) {
        return new CircuitBreakerResult(false, state, error);
    }
    /**
     * Создать результат блокировки (circuit open)
     */
    static blocked(state) {
        return new CircuitBreakerResult(false, state, 'Circuit breaker is OPEN, request blocked');
    }
}
exports.CircuitBreakerResult = CircuitBreakerResult;
