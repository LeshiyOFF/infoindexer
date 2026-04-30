"use strict";
/**
 * Утилиты для Circuit Breaker State
 *
 * @remarks
 * Infrastructure Layer — Utils в Hexagonal Architecture.
 * Содержит вспомогательные функции для работы с состоянием.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.stateToValue = stateToValue;
/**
 * Конвертирует состояние в числовое значение
 *
 * @param state - Состояние circuit breaker
 * @returns Числовое представление
 *
 * @remarks
 * closed = 0, half_open = 0.5, open = 1
 */
function stateToValue(state) {
    switch (state) {
        case 'closed':
            return 0;
        case 'half_open':
            return 0.5;
        case 'open':
            return 1;
        default:
            return 0;
    }
}
