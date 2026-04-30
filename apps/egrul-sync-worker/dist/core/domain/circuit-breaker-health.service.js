"use strict";
/**
 * Health Checker для Circuit Breaker
 *
 * @remarks
 * Domain Layer — Service в Hexagonal Architecture.
 * Выделен в отдельный класс для SRP.
 * Отвечает только за агрегацию health статуса.
 *
 * Следует SRP: ответственен только за health check.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreakerHealthChecker = void 0;
const i_circuit_breaker_port_1 = require("../ports/i-circuit-breaker.port");
/**
 * Health Checker для Circuit Breaker
 *
 * @remarks
 * Агрегирует состояние всех circuit breaker для health check.
 * Предоставляет методы для проверки состояния.
 */
class CircuitBreakerHealthChecker {
    getBreakers;
    constructor(getBreakers) {
        this.getBreakers = getBreakers;
    }
    /**
     * Возвращает агрегированный health status
     *
     * @returns Health status всех breaker
     *
     * @remarks
     * Подсчитывает количество breaker в каждом состоянии.
     */
    getHealth() {
        let closed = 0;
        let open = 0;
        let halfOpen = 0;
        const details = new Map();
        this.getBreakers().forEach((breaker, name) => {
            const stats = breaker.getStats();
            details.set(name, stats);
            switch (stats.state) {
                case i_circuit_breaker_port_1.CircuitState.CLOSED:
                    closed++;
                    break;
                case i_circuit_breaker_port_1.CircuitState.OPEN:
                    open++;
                    break;
                case i_circuit_breaker_port_1.CircuitState.HALF_OPEN:
                    halfOpen++;
                    break;
            }
        });
        return {
            total: this.getBreakers().size,
            closed,
            open,
            halfOpen,
            details
        };
    }
    /**
     * Возвращает статистику по всем breaker
     *
     * @returns Map имя → статистика
     */
    getAllStats() {
        const result = new Map();
        this.getBreakers().forEach((breaker, name) => {
            result.set(name, breaker.getStats());
        });
        return result;
    }
    /**
     * Проверяет что все breaker в CLOSED состоянии
     *
     * @returns true если все breaker закрыты
     */
    isAllClosed() {
        return this.getHealth().open === 0 &&
            this.getHealth().halfOpen === 0;
    }
    /**
     * Возвращает имена breaker в OPEN состоянии
     *
     * @returns Массив имён
     */
    getOpenBreakers() {
        const result = [];
        this.getBreakers().forEach((breaker, name) => {
            if (breaker.getState() === i_circuit_breaker_port_1.CircuitState.OPEN) {
                result.push(name);
            }
        });
        return result;
    }
}
exports.CircuitBreakerHealthChecker = CircuitBreakerHealthChecker;
