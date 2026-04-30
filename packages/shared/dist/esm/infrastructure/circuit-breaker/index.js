"use strict";
/**
 * Circuit Breaker Module Exports
 *
 * @remarks
 * Centralized exports for Circuit Breaker functionality.
 * Follows Clean Architecture: organized by layer.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNullCircuitBreaker = exports.createCircuitBreakerForAPI = exports.createCircuitBreakerForClickHouse = exports.createCircuitBreaker = exports.CircuitBreakerFactory = exports.CircuitBreakerMetricsRecorder = exports.CircuitBreakerEventsEmitter = exports.CircuitBreakerExecutor = exports.NullCircuitBreakerAdapter = exports.CircuitBreakerAdapter = void 0;
// Domain Types
__exportStar(require("./domain/types/circuit-breaker.types"), exports);
// Domain Value Objects
__exportStar(require("./domain/value-objects/circuit-breaker-config.vo"), exports);
// Ports (Interfaces)
__exportStar(require("./ports/i-circuit-breaker.port"), exports);
__exportStar(require("./ports/i-circuit-breaker-events.port"), exports);
// Adapters
var circuit_breaker_adapter_1 = require("./adapters/circuit-breaker.adapter");
Object.defineProperty(exports, "CircuitBreakerAdapter", { enumerable: true, get: function () { return circuit_breaker_adapter_1.CircuitBreakerAdapter; } });
var null_circuit_breaker_adapter_1 = require("./adapters/null-circuit-breaker.adapter");
Object.defineProperty(exports, "NullCircuitBreakerAdapter", { enumerable: true, get: function () { return null_circuit_breaker_adapter_1.NullCircuitBreakerAdapter; } });
// Handlers (internal, but exported for testing)
var circuit_breaker_executor_1 = require("./handlers/circuit-breaker-executor");
Object.defineProperty(exports, "CircuitBreakerExecutor", { enumerable: true, get: function () { return circuit_breaker_executor_1.CircuitBreakerExecutor; } });
var circuit_breaker_events_emitter_1 = require("./handlers/circuit-breaker-events-emitter");
Object.defineProperty(exports, "CircuitBreakerEventsEmitter", { enumerable: true, get: function () { return circuit_breaker_events_emitter_1.CircuitBreakerEventsEmitter; } });
var circuit_breaker_metrics_recorder_1 = require("./handlers/circuit-breaker-metrics-recorder");
Object.defineProperty(exports, "CircuitBreakerMetricsRecorder", { enumerable: true, get: function () { return circuit_breaker_metrics_recorder_1.CircuitBreakerMetricsRecorder; } });
// Factories
var circuit_breaker_factory_1 = require("./factories/circuit-breaker.factory");
Object.defineProperty(exports, "CircuitBreakerFactory", { enumerable: true, get: function () { return circuit_breaker_factory_1.CircuitBreakerFactory; } });
Object.defineProperty(exports, "createCircuitBreaker", { enumerable: true, get: function () { return circuit_breaker_factory_1.createCircuitBreaker; } });
Object.defineProperty(exports, "createCircuitBreakerForClickHouse", { enumerable: true, get: function () { return circuit_breaker_factory_1.createCircuitBreakerForClickHouse; } });
Object.defineProperty(exports, "createCircuitBreakerForAPI", { enumerable: true, get: function () { return circuit_breaker_factory_1.createCircuitBreakerForAPI; } });
Object.defineProperty(exports, "createNullCircuitBreaker", { enumerable: true, get: function () { return circuit_breaker_factory_1.createNullCircuitBreaker; } });
