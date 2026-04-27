"use strict";
/**
 * Circuit Breaker Types
 *
 * @remarks
 * Domain Layer — Types in Hexagonal Architecture.
 * Contains core types for Circuit Breaker pattern.
 *
 * @see https://martinfowler.com/bliki/CircuitBreaker.html
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitState = void 0;
/**
 * Circuit Breaker State
 *
 * @remarks
 * Three-state machine for fault tolerance:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Failing state, requests are blocked
 * - HALF_OPEN: Testing if service has recovered
 */
var CircuitState;
(function (CircuitState) {
    /** Normal operation, all requests pass through */
    CircuitState["CLOSED"] = "closed";
    /** Failing state, requests are blocked immediately */
    CircuitState["OPEN"] = "open";
    /** Testing mode, checks if service recovered */
    CircuitState["HALF_OPEN"] = "half_open";
})(CircuitState || (exports.CircuitState = CircuitState = {}));
