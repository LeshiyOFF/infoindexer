/**
 * Port для хранения данных в ClickHouse
 *
 * @remarks
 * Абстракция над ClickHouse хранилищем.
 */
import type { ColumnDefinition, FinancialReportRow } from '../types';
/**
 * Port для работы с ClickHouse
 */
export interface IClickHouseStorage {
    /**
     * Убеждается что таблица существует
     */
    ensureTable(columns: readonly ColumnDefinition[]): Promise<void>;
    /**
     * Вставляет батч строк
     */
    insertBatch(rows: readonly FinancialReportRow[]): Promise<void>;
    /**
     * Подсчитывает количество строк для указанного года
     *
     * @param year - Год для фильтрации
     * @returns Количество строк
     */
    countRows(year: number): Promise<number>;
    /**
     * Удаляет все строки за указанный год
     *
     * @param year - Год для удаления
     */
    deleteByYear(year: number): Promise<void>;
}
