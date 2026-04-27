"use strict";
/**
 * Circuit Breaker Types
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitState = void 0;
/**
 * Состояния Circuit Breaker
 */
var CircuitState;
(function (CircuitState) {
    /** Нормальная работа */
    CircuitState["CLOSED"] = "closed";
    /** Запросы блокируются */
    CircuitState["OPEN"] = "open";
    /** Пробный режим */
    CircuitState["HALF_OPEN"] = "half_open";
})(CircuitState || (exports.CircuitState = CircuitState = {}));
