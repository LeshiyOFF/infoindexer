/**
 * Port для работы с архивом батчей
 *
 * @remarks
 * Hexagonal Architecture: Port interface для доступа к архиву батчей.
 */

import type { BatchStatus } from './i-batch-history.port';

/** ИНН организации в батче */
export interface BatchInnItem {
  readonly inn: string;
  readonly name: string;
}

/** Данные контактов из API */
export interface ContactData {
  readonly emails?: readonly ContactEmail[];
  readonly phones?: readonly ContactPhone[];
  readonly director?: string;
  readonly name?: string;
}

/** Email контакт */
export interface ContactEmail {
  readonly val: string;
  readonly source: string;
  readonly type?: 'direct' | 'official' | 'general' | 'verified';
}

/** Телефон контакт */
export interface ContactPhone {
  readonly val: string;
  readonly source: string;
  readonly type?: 'direct' | 'official' | 'general' | 'verified';
}

/** Результат обработки организации в батче */
export interface BatchResult {
  readonly status: BatchStatus;
  readonly data?: ContactData;
  readonly error?: string;
}

/** Результаты всех организаций батча */
export interface BatchResults {
  readonly results: Readonly<Record<string, BatchResult>>;
}

/** Метаданные архива батча */
export interface BatchArchiveMeta {
  readonly inns: readonly BatchInnItem[];
  readonly status: BatchStatus;
  readonly totalCount: number;
  readonly completedCount: number;
}

/** Полные данные архива */
export interface BatchArchiveData {
  readonly meta: BatchArchiveMeta;
  readonly results: BatchResults;
}

/**
 * Port для работы с архивом батчей
 */
export interface IBatchArchivePort {
  /**
   * Загружает метаданные батча
   *
   * @param batchId - ID батча
   * @returns Promise с метаданными
   */
  readonly loadMeta: (batchId: string) => Promise<BatchArchiveMeta>;

  /**
   * Загружает результаты батча
   *
   * @param batchId - ID батча
   * @returns Promise с результатами
   */
  readonly loadResults: (batchId: string) => Promise<BatchResults>;
}
