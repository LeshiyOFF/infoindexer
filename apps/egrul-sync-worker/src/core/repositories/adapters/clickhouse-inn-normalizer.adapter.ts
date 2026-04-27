/**
 * Adapter для нормализации INN в ClickHouse context
 *
 * @remarks
 * Реализует Port IInnNormalizerPort для ClickHouse.
 * Основная логика нормализации находится в DEFAULT expression (Migration 007).
 *
 * Этот Adapter используется для:
 * - Compatibility checking (проверка что column существует)
 * - Fallback нормализации в application code (если нужно)
 *
 * Следует SRP: отвечает только за адаптацию к ClickHouse.
 */

import type { IInnNormalizerPort } from '../ports';

/**
 * Adapter для нормализации INN в ClickHouse
 *
 * @remarks
 * Делегирует основную работу SQL DEFAULT expression.
 * Может использоваться для application-level fallback.
 */
export class ClickHouseInnNormalizerAdapter implements IInnNormalizerPort {
  private static readonly RU_INN_PREFIX = 'ru-inn-';
  private static readonly INN_START_INDEX = 8;

  /**
   * Нормализует ID в INN
   *
   * @remarks
   * Mirror SQL logic: if(position(id, 'ru-inn-') = 1, substring(id, 8), '')
   * Используется как fallback или для consistency checking.
   */
  normalizeInn(id: string): string {
    if (!id) {
      return '';
    }

    // Проверяем префикс "ru-inn-" в начале строки
    if (id.indexOf(ClickHouseInnNormalizerAdapter.RU_INN_PREFIX) !== 0) {
      return '';
    }

    // Извлекаем ИНН после префикса
    if (id.length <= ClickHouseInnNormalizerAdapter.INN_START_INDEX) {
      return '';
    }

    return id.substring(ClickHouseInnNormalizerAdapter.INN_START_INDEX);
  }
}
