"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleCircuitBreaker = void 0;
const circuit_breaker_state_enum_1 = require("../domain/circuit-breaker-state.enum");
class ConsoleCircuitBreaker {
    config;
    breakers = new Map();
    constructor(config) {
        this.config = config;
    }
    async execute(breakerName, operation) {
        const state = this.getOrCreateState(breakerName);
        if (!this.canExecuteState(state)) {
            const message = `Circuit breaker OPEN for ${breakerName}`;
            this.emit('BLOCKED', breakerName, message);
            throw new Error(message);
        }
        try {
            const result = await operation();
            this.recordSuccess(breakerName, state);
            return result;
        }
        catch (error) {
            this.recordFailure(breakerName, state);
            throw error;
        }
    }
    getState(breakerName) {
        const state = this.breakers.get(breakerName);
        return state?.state ?? circuit_breaker_state_enum_1.CircuitBreakerState.CLOSED;
    }
    reset(breakerName) {
        const state = this.getOrCreateState(breakerName);
        state.state = circuit_breaker_state_enum_1.CircuitBreakerState.CLOSED;
        state.failures = 0;
        state.successes = 0;
        state.halfOpenCalls = 0;
        this.emit('RESET', breakerName, `Reset ${breakerName} to CLOSED`);
    }
    canExecute(breakerName) {
        const state = this.getOrCreateState(breakerName);
        return this.canExecuteState(state);
    }
    getOrCreateState(breakerName) {
        if (!this.breakers.has(breakerName)) {
            this.breakers.set(breakerName, {
                state: circuit_breaker_state_enum_1.CircuitBreakerState.CLOSED,
                failures: 0,
                successes: 0,
                lastFailureTime: 0,
                halfOpenCalls: 0
            });
        }
        return this.breakers.get(breakerName);
    }
    canExecuteState(state) {
        this.evaluateState(state);
        return state.state !== circuit_breaker_state_enum_1.CircuitBreakerState.OPEN;
    }
    recordSuccess(breakerName, state) {
        if (state.state === circuit_breaker_state_enum_1.CircuitBreakerState.HALF_OPEN) {
            state.successes++;
            state.halfOpenCalls++;
            if (state.successes >= this.config.successThreshold) {
                this.transitionTo(breakerName, state, circuit_breaker_state_enum_1.CircuitBreakerState.CLOSED);
                this.resetCounters(state);
            }
        }
        else {
            this.resetCounters(state);
        }
    }
    recordFailure(breakerName, state) {
        state.failures++;
        state.lastFailureTime = Date.now();
        if (state.failures >= this.config.failureThreshold) {
            this.transitionTo(breakerName, state, circuit_breaker_state_enum_1.CircuitBreakerState.OPEN);
        }
    }
    evaluateState(state) {
        if (state.state === circuit_breaker_state_enum_1.CircuitBreakerState.OPEN) {
            if (Date.now() - state.lastFailureTime > this.config.timeoutMs) {
                state.state = circuit_breaker_state_enum_1.CircuitBreakerState.HALF_OPEN;
                state.halfOpenCalls = 0;
            }
        }
    }
    transitionTo(breakerName, state, newState) {
        const oldState = state.state;
        state.state = newState;
        this.emit('STATE_CHANGE', breakerName, `${breakerName}: ${oldState} → ${newState}`);
    }
    resetCounters(state) {
        state.failures = 0;
        state.successes = 0;
    }
    emit(event, breakerName, message) {
        console.log(`[CIRCUIT_BREAKER:${event}] ${breakerName} - ${message}`);
    }
}
exports.ConsoleCircuitBreaker = ConsoleCircuitBreaker;
