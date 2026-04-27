/**
 * Уровень риска санкционной метки
 *
 * Используется для классификации степени риска
 * связанной с конкретным topic или их комбинацией
 */
export enum SanctionLevel {
  /**
   * Высокий риск
   * Прямые санкции, серьёзные преступления, терроризм
   */
  HIGH = 'high',

  /**
   * Средний риск
   * PEP, связи с санкционными лицами, коррупция
   */
  MEDIUM = 'medium',

  /**
   * Низкий риск
   * Государственные служащие, посредники
   */
  LOW = 'low',

  /**
   * Риск не определён
   * Нет санкционных меток
   */
  NONE = 'none',
}

/**
 * Все уровни риска
 */
export const ALL_SANCTION_LEVELS: readonly SanctionLevel[] = Object.values(SanctionLevel) as readonly SanctionLevel[];

/**
 * Числовое значение уровня риска для сортировки
 * Чем выше значение — тем выше риск
 */
export const SANCTION_LEVEL_WEIGHT: Readonly<Record<SanctionLevel, number>> = {
  [SanctionLevel.NONE]: 0,
  [SanctionLevel.LOW]: 1,
  [SanctionLevel.MEDIUM]: 2,
  [SanctionLevel.HIGH]: 3,
} as const;

/**
 * Сравнивает два уровня риска
 * @returns положительное число если a > b, отрицательное если a < b, 0 если равны
 */
export function compareSanctionLevels(a: SanctionLevel, b: SanctionLevel): number {
  return SANCTION_LEVEL_WEIGHT[a] - SANCTION_LEVEL_WEIGHT[b];
}

/**
 * Возвращает максимальный уровень риска из двух
 */
export function maxSanctionLevel(a: SanctionLevel, b: SanctionLevel): SanctionLevel {
  return compareSanctionLevels(a, b) >= 0 ? a : b;
}
