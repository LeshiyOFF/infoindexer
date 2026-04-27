"use strict";
/**
 * Типы для Circuit Breaker Port
 *
 * @remarks
 * Domain Layer — Types в Hexagonal Architecture.
 * Содержит типы для Circuit Breaker.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitState = void 0;
/**
 * Состояние Circuit Breaker
 *
 * @remarks
 * Enum определяет три состояния state machine:
 * - CLOSED: нормальная работа, запросы проходят
 * - OPEN: цепь разомкнута, запросы блокируются
 * - HALF_OPEN: пробный режим, проверка восстановления
 */
var CircuitState;
(function (CircuitState) {
    /** Нормальная работа, все запросы выполняются */
    CircuitState["CLOSED"] = "closed";
    /** Цепь разомкнута, запросы блокируются немедленно */
    CircuitState["OPEN"] = "open";
    /** Пробный режим, один запрос проверяет доступность */
    CircuitState["HALF_OPEN"] = "half_open";
})(CircuitState || (exports.CircuitState = CircuitState = {}));
