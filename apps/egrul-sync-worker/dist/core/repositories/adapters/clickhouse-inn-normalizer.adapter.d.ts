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
export declare class ClickHouseInnNormalizerAdapter implements IInnNormalizerPort {
    private static readonly RU_INN_PREFIX;
    private static readonly INN_START_INDEX;
    /**
     * Нормализует ID в INN
     *
     * @remarks
     * Mirror SQL logic: if(position(id, 'ru-inn-') = 1, substring(id, 8), '')
     * Используется как fallback или для consistency checking.
     */
    normalizeInn(id: string): string;
}
