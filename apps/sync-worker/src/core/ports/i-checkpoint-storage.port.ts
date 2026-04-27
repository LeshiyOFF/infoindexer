/**
 * Port для хранения чекпоинтов синхронизации
 *
 * @remarks
 * Абстракция над хранилищем чекпоинтов для resume.
 * Принадлежит слою Ports (Domain).
 * Не зависит от конкретных реализаций (Redis, ClickHouse).
 */

/**
 * Данные чекпоинта
 */
export interface CheckpointData {
  /** Обработано строк */
  readonly processedRows: number;
  /** Процент выполнения */
  readonly percentage: number;
  /** Контрольная сумма для верификации */
  readonly checksum?: string;
  /** Timestamp сохранения */
  readonly timestamp: number;
}

/**
 * Port для хранения чекпоинтов синхронизации
 *
 * @remarks
 * Позволяет сохранять, загружать и очищать чекпоинты.
 * Используется для resume синхронизации после прерывания.
 */
export interface ICheckpointStorage {
  /**
   * Сохраняет чекпоинт
   *
   * @param year - Год синхронизации
   * @param processedRows - Количество обработанных строк
   * @param percentage - Процент выполнения
   * @param checksum - Опциональная контрольная сумма
   */
  save(year: number, processedRows: number, percentage: number, checksum?: string): Promise<void>;

  /**
   * Загружает чекпоинт
   *
   * @param year - Год синхронизации
   * @returns Данные чекпоинта или null если не существует
   */
  load(year: number): Promise<CheckpointData | null>;

  /**
   * Очищает чекпоинт
   *
   * @param year - Год синхронизации
   */
  clear(year: number): Promise<void>;

  /**
   * Проверяет целостность чекпоинта
   *
   * @param year - Год синхронизации
   * @param expectedChecksum - Ожидаемая контрольная сумма
   * @returns true если чекпоинт валиден
   */
  verify(year: number, expectedChecksum: string): Promise<boolean>;
}
