"use strict";
/**
 * Circuit Breaker Manager — Facade для управления CB
 *
 * @remarks
 * Domain Layer — Service в Hexagonal Architecture.
 * Facade Pattern: единая точка входа для всех CB операций.
 * Делегирует работу CircuitBreakerRegistry и CircuitBreakerHealthChecker.
 *
 * Следует SRP: ответственен только за координацию.
 * Следует Facade Pattern: скрывает сложность работы с реестром.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreakerManager = void 0;
const i_circuit_breaker_port_1 = require("../ports/i-circuit-breaker.port");
const circuit_breaker_registry_service_1 = require("./circuit-breaker-registry.service");
const circuit_breaker_health_service_1 = require("./circuit-breaker-health.service");
/**
 * Facade для управления Circuit Breaker
 *
 * @remarks
 * Реализует ICircuitBreakerManagerPort.
 * Делегирует работу CircuitBreakerRegistry и CircuitBreakerHealthChecker.
 */
class CircuitBreakerManager {
    registry;
    healthChecker;
    constructor() {
        this.registry = new circuit_breaker_registry_service_1.CircuitBreakerRegistry();
        this.healthChecker = new circuit_breaker_health_service_1.CircuitBreakerHealthChecker(() => this.registry.getAllBreakers());
    }
    registerFactory(breakerName, factory) {
        this.registry.registerFactory(breakerName, factory);
    }
    register(name, breaker) {
        this.registry.register(name, breaker);
    }
    has(breakerName) {
        return this.registry.has(breakerName);
    }
    names() {
        return this.registry.names();
    }
    getOrCreateBreaker(breakerName) {
        return this.registry.getOrCreate(breakerName);
    }
    getHealth() {
        return this.healthChecker.getHealth();
    }
    resetAll() {
        this.registry.resetAll();
    }
    reset(breakerName) {
        return this.registry.reset(breakerName);
    }
    isAllClosed() {
        return this.healthChecker.isAllClosed();
    }
    getOpenBreakers() {
        return this.healthChecker.getOpenBreakers();
    }
    async execute(breakerName, fn) {
        const breaker = this.getOrCreateBreaker(breakerName);
        return breaker.execute(fn);
    }
    async executeWithFallback(breakerName, fn, fallback) {
        const breaker = this.getOrCreateBreaker(breakerName);
        // CircuitError в адаптере это string, конвертируем в Error
        return breaker.executeWithFallback(fn, async (circuitError) => {
            const error = new Error(typeof circuitError === 'string' ? circuitError : String(circuitError));
            return fallback(error);
        });
    }
    getState(breakerName) {
        const breaker = this.registry.get(breakerName);
        return breaker?.getState() ?? i_circuit_breaker_port_1.CircuitState.CLOSED;
    }
}
exports.CircuitBreakerManager = CircuitBreakerManager;
