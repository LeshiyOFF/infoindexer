/**
 * Circuit Breaker Events Emitter
 *
 * @remarks
 * Infrastructure Layer — Event Emitter in Hexagonal Architecture.
 * Extracted for SRP: Responsible only for emitting events.
 *
 * Follows SRP: Responsible only for event emission.
 * Follows Observer Pattern: Notifies subscribers.
 */
/**
 * Circuit Breaker Events Emitter
 *
 * @remarks
 * Wrapper over ICircuitBreakerEventsPort for convenient usage.
 * All methods optional — if handler doesn't implement method, nothing happens.
 */
export class CircuitBreakerEventsEmitter {
    events;
    constructor(events) {
        this.events = events;
    }
    /**
     * Emit state change event
     *
     * @param breakerName - Circuit breaker name
     * @param previous - Previous state
     * @param current - New state
     * @param timestamp - Event timestamp
     * @param reason - Change reason
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
     * Emit failure event
     *
     * @param breakerName - Circuit breaker name
     * @param state - Current state
     * @param error - Error
     * @param timestamp - Event timestamp
     * @param failureCount - Total failures
     * @param failuresInWindow - Failures in sliding window
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
     * Emit success event
     *
     * @param breakerName - Circuit breaker name
     * @param state - Current state
     * @param timestamp - Event timestamp
     * @param successCount - Consecutive successes
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
     * Emit reset event
     *
     * @param breakerName - Circuit breaker name
     * @param previousState - State before reset
     * @param timestamp - Event timestamp
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
     * Check if events handler is present
     *
     * @returns true if events handler installed
     */
    hasEvents() {
        return this.events !== undefined;
    }
}
