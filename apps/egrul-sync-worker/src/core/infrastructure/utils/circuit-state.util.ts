/**
 * Утилиты для Circuit Breaker State
 *
 * @remarks
 * Infrastructure Layer — Utils в Hexagonal Architecture.
 * Содержит вспомогательные функции для работы с состоянием.
 */

import type { CircuitState } from '../../ports/i-circuit-breaker.port';

/**
 * Конвертирует состояние в числовое значение
 *
 * @param state - Состояние circuit breaker
 * @returns Числовое представление
 *
 * @remarks
 * closed = 0, half_open = 0.5, open = 1
 */
export function stateToValue(state: CircuitState): number {
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
