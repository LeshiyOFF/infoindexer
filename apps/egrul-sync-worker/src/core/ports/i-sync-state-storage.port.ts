/**
 * Port для хранения состояния синхронизации
 *
 * @remarks
 * Абстрагирует способ хранения и получения состояния синхронизации.
 * Следует Dependency Inversion: бизнес-логика зависит от этого Port,
 * а Infrastructure Layer предоставляет реализацию.
 *
 * Следует Interface Segregation: только необходимые методы для управления
 * состоянием синхронизации.
 */
export interface ISyncStateStoragePort {
  /**
   * Получает временную метку последней успешной синхронизации
   *
   * @param syncType - Тип синхронизации (например, 'identity_mapping')
   * @returns Timestamp последней синхронизации или null если не было
   *
   * @throws Error если запрос к хранилищу fails
   */
  getLastSyncTimestamp(syncType: string): Promise<Date | null>;

  /**
   * Сохраняет временную метку синхронизации
   *
   * @remarks
   * Создаёт новую запись в таблице состояния синхронизации.
   * ReplacingMergeTree engine автоматически удаляет старые записи.
   *
   * @param syncType - Тип синхронизации
   * @param timestamp - Временная метка синхронизации
   *
   * @throws Error если вставка fails
   */
  saveSyncTimestamp(syncType: string, timestamp: Date): Promise<void>;

  /**
   * Сохраняет результаты синхронизации с метриками
   *
   * @remarks
   * Расширенная версия saveSyncTimestamp с дополнительными метриками.
   *
   * @param syncType - Тип синхронизации
   * @param timestamp - Временная метка синхронизации
   * @param recordsProcessed - Количество обработанных записей
   * @param durationMs - Длительность синхронизации в миллисекундах
   *
   * @throws Error если вставка fails
   */
  saveSyncResult(
    syncType: string,
    timestamp: Date,
    recordsProcessed: number,
    durationMs: number
  ): Promise<void>;

  /**
   * Получает количество обработанных записей из последней синхронизации
   *
   * @param syncType - Тип синхронизации
   * @returns Количество обработанных записей или 0 если нет данных
   *
   * @throws Error если запрос к хранилищу fails
   */
  getRecordsProcessed(syncType: string): Promise<number>;
}
