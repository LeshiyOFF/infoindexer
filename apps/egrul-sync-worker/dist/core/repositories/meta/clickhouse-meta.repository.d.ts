/**
 * Adapter для управления meta tables в ClickHouse
 *
 * @remarks
 * Реализует Port IMetaStorage для ClickHouse.
 * Отвечает за CRUD операции с существующими таблицами.
 * Создание таблиц происходит через миграции при старте приложения.
 *
 * Stateful операции:
 * - clearPartialData: TRUNCATE raw tables + identity_mapping (сохраняет схему)
 * - cleanupRawTables: TRUNCATE raw tables после успешной синхронизации
 */
import type { ClickHouseClient } from '@clickhouse/client';
import type { EgrulCompanyRow, EgrulDirectorshipRow, EgrulOwnershipRow, EgrulPersonRow } from '../../entities';
import type { EgrulDirectorRow, EgrulFounderRow } from '../../domain/entities';
import type { IMetaStorage } from './ports';
/**
 * Union type for all supported row types
 *
 * @remarks
 * Includes both legacy (intermediate) and MV (direct insert) row types.
 */
export type SupportedRow = EgrulCompanyRow | EgrulPersonRow | EgrulDirectorshipRow | EgrulOwnershipRow | EgrulDirectorRow | EgrulFounderRow;
/**
 * Adapter для управления meta tables в ClickHouse
 *
 * @remarks
 * Следует SRP: отвечает только за операции с данными,
 * не за создание схемы (DDL).
 */
export declare class ClickHouseMetaRepository implements IMetaStorage {
    private readonly client;
    constructor(client: ClickHouseClient);
    /**
     * Конвертирует Date в Unix timestamp (ms) для ClickHouse DateTime64(3, 'UTC')
     *
     * @remarks
     * DateTime64 хранит Unix timestamp в микросекундах.
     * Для DateTime64(3) precision=3 → milliseconds, поэтому используем getTime().
     */
    private formatDate;
    /**
     * Проверяет наличие временных полей в записи
     */
    private hasTemporalFields;
    /**
     * Подготавливает записи для вставки, форматируя даты
     *
     * @remarks
     * Только Company и Person имеют временные поля.
     * MV row types (DirectorRow, FounderRow) don't have temporal fields.
     */
    private prepareRecords;
    /**
     * Вставляет батч записей в указанную таблицу
     *
     * @param table - Имя таблицы
     * @param values - Массив записей
     *
     * @remarks
     * Supports both legacy and MV row types.
     */
    insertBatch(table: string, values: SupportedRow[]): Promise<void>;
    /**
     * Очищает временные raw таблицы после обработки
     *
     * @remarks
     * Удаляет данные из временных таблиц после импорта в целевые таблицы.
     * Таблицы пересоздаются через TRUNCATE для сохранения схемы.
     */
    cleanupRawTables(): Promise<void>;
    /**
     * Удаляет частично загруженные данные при abort
     *
     * @remarks
     * Очищает raw таблицы через TRUNCATE.
     * identity_mapping очищается через TRUNCATE (не DROP) для пересборки.
     * companies_meta не затрагивается (полная перезагрузка).
     */
    clearPartialData(): Promise<void>;
}
