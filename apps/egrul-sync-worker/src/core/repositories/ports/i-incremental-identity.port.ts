/**
 * Port для инкрементального построения identity mapping
 *
 * @remarks
 * Определяет интерфейс для построения identity mapping.
 * Поддерживает два режима: full rebuild и incremental update.
 *
 * Режимы работы:
 * - `full`: полная перезапись (TRUNCATE + INSERT)
 * - `incremental`: только новые записи (WHERE created_at > @last_sync)
 *
 * @example
 * ```ts
 * // Первый запуск - полная синхронизация
 * await identityPort.build('full');
 *
 * // Последующие запуски - только изменения
 * await identityPort.build('incremental', new Date('2026-04-22'));
 * ```
 */
export interface IIncrementalIdentityPort {
  /**
   * Строит identity mapping
   *
   * @param mode - режим: 'full' или 'incremental'
   * @param since - timestamp для incremental mode
   * @returns результат с числом обработанных записей
   *
   * @throws Error если операция fails
   *
   * @remarks
   * - `full`: очищает таблицу и вставляет все записи
   * - `incremental`: вставляет только записи после since
   */
  build(
    mode: 'full' | 'incremental',
    since?: Date
  ): Promise<IdentityMappingResult>;
}

/**
 * Результат построения identity mapping
 *
 * @remarks
 * Содержит статистику обработки persons и companies.
 */
export interface IdentityMappingResult {
  /** Количество обработанных person entities */
  readonly personsProcessed: number;
  /** Количество обработанных company entities */
  readonly companiesProcessed: number;
  /** Длительность обработки в миллисекундах */
  readonly durationMs: number;
}
