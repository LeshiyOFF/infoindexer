"use strict";
/**
 * Factory для Circuit Breaker Configuration
 *
 * @remarks
 * Domain Layer — Factory в Hexagonal Architecture.
 * Создаёт преднастроенные конфигурации для разных случаев.
 *
 * Следует SRP: ответственен только за создание конфигураций.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CBConfigFactory = exports.CircuitBreakerConfigFactory = void 0;
const circuit_breaker_config_vo_1 = require("../value-objects/circuit-breaker-config.vo");
/**
 * Factory для Circuit Breaker Configuration
 *
 * @remarks
 * Предоставляет преднастроенные конфигурации для разных сценариев.
 */
class CircuitBreakerConfigFactory {
    /**
     * Создаёт конфигурацию по умолчанию
     *
     * @returns Конфигурация со сбалансированными параметрами
     */
    static default() {
        return new circuit_breaker_config_vo_1.CircuitBreakerConfigVO(5, 60000, 30000, 60000, 3, 2);
    }
    /**
     * Создаёт строгою конфигурацию
     *
     * @returns Конфигурация с низкими порогами и длинными таймаутами
     *
     * @remarks
     * Используется для критических систем где нужен быстрый failover.
     */
    static strict() {
        return new circuit_breaker_config_vo_1.CircuitBreakerConfigVO(3, 120000, 60000, 30000, 2, 5);
    }
    /**
     * Создаёт мягкую конфигурацию
     *
     * @returns Конфигурация с высокими порогами и короткими таймаутами
     *
     * @remarks
     * Используется для менее критичных систем где допустимы retry.
     */
    static lenient() {
        return new circuit_breaker_config_vo_1.CircuitBreakerConfigVO(10, 30000, 15000, 120000, 10, 1);
    }
    /**
     * Создаёт конфигурацию для внешних API
     *
     * @returns Конфигурация оптимизированная для внешних API
     *
     * @remarks
     * Баланс между надёжностью и скоростью восстановления.
     */
    static forExternalAPI() {
        return new circuit_breaker_config_vo_1.CircuitBreakerConfigVO(5, 60000, 30000, 90000, 3, 2);
    }
    /**
     * Создаёт конфигурацию для баз данных
     *
     * @returns Конфигурация оптимизированная для баз данных
     *
     * @remarks
     * Низкий порог неудач, быстрый half-open, мало вызовов в half-open.
     */
    static forDatabase() {
        return new circuit_breaker_config_vo_1.CircuitBreakerConfigVO(3, 120000, 30000, 30000, 1, 2);
    }
    /**
     * Создаёт оптимальную конфигурацию для количества записей
     *
     * @param recordCount - Количество записей
     * @returns Конфигурация с оптимальными параметрами
     *
     * @remarks
     * Подстраивает batch size под количество записей.
     */
    static optimalFor(recordCount) {
        const targetBatches = Math.max(32, Math.ceil(recordCount / 10_000_000));
        const optimalSize = Math.ceil(recordCount / targetBatches);
        const clampedSize = Math.min(10_000_000, Math.max(1_000_000, optimalSize));
        return new circuit_breaker_config_vo_1.CircuitBreakerConfigVO(5, 60000, 30000, 60000, 3, 2);
    }
}
exports.CircuitBreakerConfigFactory = CircuitBreakerConfigFactory;
/**
 * Алиас для обратной совместимости
 *
 * @deprecated Используйте CircuitBreakerConfigFactory
 */
exports.CBConfigFactory = CircuitBreakerConfigFactory;
