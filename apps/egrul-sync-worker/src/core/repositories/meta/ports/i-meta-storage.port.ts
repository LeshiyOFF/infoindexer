import type {
  EgrulCompanyRow,
  EgrulDirectorshipRow,
  EgrulOwnershipRow,
  EgrulPersonRow
} from '../../../entities';
import type {
  EgrulDirectorRow,
  EgrulFounderRow
} from '../../../domain/entities';

/**
 * Union type for all supported row types
 *
 * @remarks
 * Includes both legacy (intermediate) and MV (direct insert) row types.
 */
export type SupportedRow =
  | EgrulCompanyRow
  | EgrulPersonRow
  | EgrulDirectorshipRow
  | EgrulOwnershipRow
  | EgrulDirectorRow
  | EgrulFounderRow;

/**
 * Port для работы с meta tables в ClickHouse
 *
 * @remarks
 * Доменный интерфейс для управления метаданными EGRUL.
 * Отделяет бизнес-логику от инфраструктуры хранения.
 *
 * Создание таблиц происходит через миграции при старте приложения.
 * Этот порт отвечает только за CRUD операции с существующими таблицами.
 */
export interface IMetaStorage {
  /**
   * Вставляет батч записей в указанную таблицу
   *
   * @param table - Имя таблицы
   * @param values - Массив записей
   *
   * @remarks
   * Supports both legacy and MV row types for flexible insert.
   */
  insertBatch(
    table: string,
    values: SupportedRow[]
  ): Promise<void>;

  /**
   * Очищает временные raw таблицы
   */
  cleanupRawTables(): Promise<void>;

  /**
   * Удаляет частично загруженные данные при abort
   *
   * @remarks
   * Очищает raw таблицы и identity_mapping через TRUNCATE.
   * Таблицы сохраняются для пересборки при следующей синхронизации.
   * companies_meta не затрагивается (полная перезагрузка).
   */
  clearPartialData(): Promise<void>;
}
