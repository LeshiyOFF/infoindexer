import type { SanctionRow } from 'shared/repositories/sanction.repository';
/**
 * Подготавливает значения для вставки в ClickHouse
 *
 * @param row - Строка санкций
 * @returns Объект для вставки в БД
 */
export declare function prepareInsertValue(row: SanctionRow): Record<string, unknown>;
/**
 * Подготавливает батч значений для вставки в ClickHouse
 *
 * @param rows - Массив строк санкций
 * @returns Массив объектов для вставки в БД
 */
export declare function prepareInsertBatch(rows: readonly SanctionRow[]): Record<string, unknown>[];
