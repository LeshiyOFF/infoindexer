import { CircuitBreakerState } from '../domain/circuit-breaker-state.enum';
export class ConsoleCircuitBreaker {
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
        return state?.state ?? CircuitBreakerState.CLOSED;
    }
    reset(breakerName) {
        const state = this.getOrCreateState(breakerName);
        state.state = CircuitBreakerState.CLOSED;
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
                state: CircuitBreakerState.CLOSED,
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
        return state.state !== CircuitBreakerState.OPEN;
    }
    recordSuccess(breakerName, state) {
        if (state.state === CircuitBreakerState.HALF_OPEN) {
            state.successes++;
            state.halfOpenCalls++;
            if (state.successes >= this.config.successThreshold) {
                this.transitionTo(breakerName, state, CircuitBreakerState.CLOSED);
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
            this.transitionTo(breakerName, state, CircuitBreakerState.OPEN);
        }
    }
    evaluateState(state) {
        if (state.state === CircuitBreakerState.OPEN) {
            if (Date.now() - state.lastFailureTime > this.config.timeoutMs) {
                state.state = CircuitBreakerState.HALF_OPEN;
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
