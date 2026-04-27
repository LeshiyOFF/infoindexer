/**
 * Port для экспорта и перезапуска батчей
 *
 * @remarks
 * Hexagonal Architecture: Port interface для экспорта и перезапуска батчей.
 */

import type { BatchInnItem } from './i-batch-archive.port';

/** Результат перезапуска батча */
export interface BatchRerunResult {
  readonly batchId: string;
  readonly success: boolean;
  readonly error?: string;
}

/**
 * Port для экспорта и перезапуска батчей
 */
export interface IBatchExportPort {
  /**
   * Экспортирует результаты батча в XLSX
   *
   * @param batchId - ID батча
   * @returns Promise с Blob файла
   * @throws Error при ошибке экспорта
   */
  readonly exportXlsx: (batchId: string) => Promise<Blob>;

  /**
   * Создаёт и запускает новый батч с теми же ИНН
   *
   * @param inns - Массив ИНН для повторного запуска
   * @returns Promise с ID нового батча
   * @throws Error при ошибке создания/запуска
   */
  readonly rerunBatch: (inns: readonly BatchInnItem[]) => Promise<string>;
}
