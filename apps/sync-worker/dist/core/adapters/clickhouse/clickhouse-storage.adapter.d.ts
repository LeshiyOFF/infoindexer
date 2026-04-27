/**
 * Адаптер для хранения данных в ClickHouse
 *
 * @remarks
 * Реализует IClickHouseStorage порт с помощью ClickHouse клиента.
 * Использует ReplacingMergeTree для автоматической дедупликации.
 *
 * ВАЖНО: Таблица financial_reports создаётся через миграцию
 * 001_financial_reports_replacingmerge.sql. Метод ensureTable()
 * только проверяет существование и корректность Engine.
 */
import type { ClickHouseClient } from '@clickhouse/client';
import type { IClickHouseStorage } from '../../ports';
import type { ColumnDefinition, FinancialReportRow } from '../../types';
/**
 * Адаптер для хранения данных в ClickHouse
 */
export declare class ClickHouseStorageAdapter implements IClickHouseStorage {
    private readonly client;
    private readonly tableName;
    private readonly expectedEngine;
    constructor(client: ClickHouseClient);
    /**
     * Проверяет что таблица существует с корректной схемой
     *
     * @remarks
     * Таблица создаётся через миграцию. Этот метод только проверяет
     * существование и корректность Engine. Если таблица не существует
     * или имеет неверный Engine — выбрасывает ошибку.
     *
     * @throws Error если таблица не существует или Engine неверный
     */
    ensureTable(columns: readonly ColumnDefinition[]): Promise<void>;
    /**
     * Вставляет батч строк с updated_at
     *
     * @remarks
     * Добавляет updated_at для каждой строки.
     * ReplacingMergeTree использует это поле для выбора последней версии при дедупликации.
     *
     * @note updated_at добавляется здесь, а не в CREATE TABLE,
     * чтобы поддерживать гибкость при вставке данных.
     * ClickHouse client сам сериализует объекты в JSONEachRow формат.
     */
    insertBatch(rows: readonly FinancialReportRow[]): Promise<void>;
    /**
     * Подсчитывает количество уникальных строк для указанного года
     *
     * @remarks
     * Использует FINAL для получения дедуплицированных данных.
     * ReplacingMergeTree удаляет дубликаты только при FINAL или OPTIMIZE.
     */
    countRows(year: number): Promise<number>;
    /**
     * Удаляет все строки за указанный год
     *
     * @remarks
     * Использует lightweight mutation ALTER TABLE DELETE.
     * Операция асинхронная, но блокирует чтение удалённых данных.
     */
    deleteByYear(year: number): Promise<void>;
    /**
     * Проверяет что таблица существует
     */
    private tableExists;
    /**
     * Валидирует что таблица использует корректный Engine
     *
     * @throws Error если Engine не ReplacingMergeTree
     */
    private validateEngine;
    /**
     * Форматирует текущее время в формате ClickHouse DateTime
     */
    private getCurrentTimestamp;
}
