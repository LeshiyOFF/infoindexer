/**
 * Domain Service для архива батчей
 *
 * @remarks
 * Содержит бизнес-логику работы с архивом батчей.
 * Зависит от Ports (IBatchArchivePort, IBatchExportPort).
 * Hexagonal Architecture: Domain layer.
 */

import type {
  IBatchArchivePort,
  IBatchExportPort,
  BatchArchiveMeta,
  BatchResults,
  BatchInnItem,
  BatchStatus,
  BatchArchiveData
} from '../ports';
import { getProgressPercentage } from '@/lib/batch-status.utils';

/** Ошибка операции с архивом */
export interface BatchArchiveError {
  readonly message: string;
  readonly code?: string;
}

/**
 * Domain Service для архива батчей
 */
export class BatchArchiveService {
  constructor(
    private readonly archivePort: IBatchArchivePort,
    private readonly exportPort: IBatchExportPort
  ) {}

  /**
   * Загружает полные данные батча (meta + results)
   *
   * @param batchId - ID батча
   * @returns Promise с метаданными и результатами
   */
  readonly loadBatchData = async (batchId: string): Promise<BatchArchiveData> => {
    const [meta, results] = await Promise.all([
      this.archivePort.loadMeta(batchId),
      this.archivePort.loadResults(batchId)
    ]);
    return { meta, results };
  };

  /**
   * Загружает только метаданные
   *
   * @param batchId - ID батча
   * @returns Promise с метаданными
   */
  readonly loadMeta = async (batchId: string): Promise<BatchArchiveMeta> => {
    return this.archivePort.loadMeta(batchId);
  };

  /**
   * Загружает только результаты
   *
   * @param batchId - ID батча
   * @returns Promise с результатами
   */
  readonly loadResults = async (batchId: string): Promise<BatchResults> => {
    return this.archivePort.loadResults(batchId);
  };

  /**
   * Экспортирует батч в XLSX
   *
   * @param batchId - ID батча
   * @throws Error при ошибке экспорта
   */
  readonly exportBatch = async (batchId: string): Promise<void> => {
    try {
      const blob = await this.exportPort.exportXlsx(batchId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `batch-${batchId}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ошибка экспорта';
      throw new Error(message);
    }
  };

  /**
   * Перезапускает батч с теми же ИНН
   *
   * @param inns - Массив ИНН
   * @returns ID нового батча
   * @throws Error при ошибке перезапуска
   */
  readonly rerunBatch = async (inns: readonly BatchInnItem[]): Promise<string> => {
    if (inns.length === 0) {
      throw new Error('Нет ИНН для перезапуска');
    }
    return this.exportPort.rerunBatch(inns);
  };

  /**
   * Проверяет, нужно ли запускать polling для статуса
   *
   * @param status - Статус батча
   * @returns true если батч还在 выполняется
   */
  readonly shouldPoll = (status: BatchStatus): boolean => {
    return status === 'running';
  };

  /**
   * Проверяет, выполняется ли батч
   *
   * @param meta - Метаданные батча
   * @returns true если батч выполняется
   */
  readonly isRunning = (meta: BatchArchiveMeta): boolean => {
    return this.shouldPoll(meta.status);
  };

  /** Вычисляет процент выполнения */
  readonly getProgressPercentage = (meta: BatchArchiveMeta): number => {
    return getProgressPercentage(meta.completedCount, meta.totalCount);
  };
}
