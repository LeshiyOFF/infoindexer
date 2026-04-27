"use strict";
/**
 * Circuit Breaker — Facade для обратной совместимости
 *
 * @remarks
 * Infrastructure Layer — Facade Pattern.
 * Обёртка над CircuitBreakerAdapter для сохранения обратной совместимости.
 *
 * @deprecated Рекомендуется использовать ICircuitBreakerPort напрямую
 * через CircuitBreakerAdapter или CircuitBreakerManagerService.
 *
 * Старый API остаётся работающим для существующего кода.
 * Новый код должен использовать Port interface.
 *
 * @example
 * ```ts
 * // Old API (still works)
 * const breaker = new CircuitBreaker(config);
 * const result = await breaker.execute(fn);
 *
 * // New API (recommended)
 * const breaker = new CircuitBreakerAdapter('name', config, metrics);
 * const result = await breaker.execute(fn);
 * ```
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
exports.CircuitBreakerConfigVO = exports.CircuitBreakerAdapter = exports.CircuitStateStorage = exports.CircuitBreaker = exports.DEFAULT_CIRCUIT_CONFIG = void 0;
const circuit_breaker_adapter_1 = require("./adapters/circuit-breaker.adapter");
/**
 * Значения по умолчанию (legacy)
 *
 * @remarks
 * @deprecated Используйте CircuitBreakerConfigVO.default()
 */
exports.DEFAULT_CIRCUIT_CONFIG = {
    failureThreshold: 5,
    halfOpenTimeout: 60000,
    openTimeout: 30000,
    slidingWindowSize: 10000
};
/**
 * Circuit Breaker — Facade
 *
 * @remarks
 * Facade Pattern: предоставляет простой интерфейс к сложной подсистеме.
 * Делегирует выполнение CircuitBreakerAdapter.
 *
 * Сохраняет обратную совместимость со старым кодом.
 */
class CircuitBreaker {
    adapter;
    /**
     * Создаёт Circuit Breaker
     *
     * @param config - Конфигурация (legacy или новая)
     * @param now - Функция получения времени (для тестов)
     *
     * @remarks
     * Принимает как старую так и новую конфигурацию.
     * Автоматически конвертирует в новый формат.
     */
    constructor(config = exports.DEFAULT_CIRCUIT_CONFIG, now) {
        const normalizedConfig = this.normalizeConfig(config);
        this.adapter = new circuit_breaker_adapter_1.CircuitBreakerAdapter('default', normalizedConfig, undefined, undefined, now);
    }
    /**
     * Текущее состояние
     *
     * @deprecated Используйте getState()
     */
    get currentState() {
        return this.adapter.getState();
    }
    /**
     * Возвращает текущее состояние
     *
     * @returns Текущее состояние circuit breaker
     */
    getState() {
        return this.adapter.getState();
    }
    /**
     * Выполняет функцию с защитой Circuit Breaker
     *
     * @param fn - Функция для выполнения
     * @returns Результат выполнения
     *
     * @remarks
     * Сохраняет старую сигнатуру для совместимости.
     */
    async execute(fn) {
        return this.adapter.execute(fn);
    }
    /**
     * Выполняет функцию с fallback при ошибке
     *
     * @param fn - Основная функция
     * @param fallback - Fallback функция
     * @returns Результат выполнения или fallback
     */
    async executeWithFallback(fn, fallback) {
        return this.adapter.executeWithFallback(fn, fallback);
    }
    /**
     * Принудительный сброс
     */
    reset() {
        this.adapter.reset();
    }
    /**
     * Проверяет, может ли запрос быть выполнен
     *
     * @returns true если запрос может быть выполнен
     */
    canProceed() {
        return this.adapter.canProceed();
    }
    /**
     * Статистика для мониторинга
     *
     * @returns Статистика circuit breaker
     */
    getStats() {
        return this.adapter.getStats();
    }
    /**
     * Нормализует конфигурацию в новый формат
     *
     * @param config - Старая или новая конфигурация
     * @returns Нормализованная конфигурация
     */
    normalizeConfig(config) {
        // Если есть successThreshold, значит это уже новый формат
        if ('successThreshold' in config) {
            return config;
        }
        // Конвертируем из старого формата
        return {
            failureThreshold: config.failureThreshold,
            openTimeout: config.openTimeout,
            halfOpenTimeout: config.halfOpenTimeout,
            slidingWindowSize: config.slidingWindowSize,
            halfOpenMaxCalls: 3,
            successThreshold: 2
        };
    }
}
exports.CircuitBreaker = CircuitBreaker;
// Re-export types for backward compatibility
__exportStar(require("./circuit-breaker-types"), exports);
__exportStar(require("./circuit-breaker-config"), exports);
var circuit_breaker_state_1 = require("./circuit-breaker-state");
Object.defineProperty(exports, "CircuitStateStorage", { enumerable: true, get: function () { return circuit_breaker_state_1.CircuitStateStorage; } });
var circuit_breaker_adapter_2 = require("./adapters/circuit-breaker.adapter");
Object.defineProperty(exports, "CircuitBreakerAdapter", { enumerable: true, get: function () { return circuit_breaker_adapter_2.CircuitBreakerAdapter; } });
var circuit_breaker_config_vo_1 = require("../domain/value-objects/circuit-breaker-config.vo");
Object.defineProperty(exports, "CircuitBreakerConfigVO", { enumerable: true, get: function () { return circuit_breaker_config_vo_1.CircuitBreakerConfigVO; } });
