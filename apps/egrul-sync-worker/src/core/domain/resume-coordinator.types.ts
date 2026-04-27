/**
 * Типы для Resume Coordinator
 *
 * @remarks
 * Константы и DTO для HTTP Range resume.
 * Вынесены в отдельный файл для соблюдения лимита 200 строк.
 */

import type { ResumeState } from '../ports';

/** Максимальный возраст состояния (24 часа) */
export const MAX_STATE_AGE_MS = 24 * 60 * 60 * 1000;

/** Интервал сохранения состояния (10 MB) */
export const SAVE_INTERVAL_BYTES = 10 * 1024 * 1024;

/**
 * Параметры для сохранения состояния
 */
export interface SaveStateParams {
  /** Текущая позиция в байтах */
  downloadedBytes: number;
  /** Общий размер файла */
  totalBytes: number;
  /** ETag от сервера */
  etag?: string;
  /** Last-Modified от сервера */
  lastModified?: string;
}

/**
 * Информация о возобновлении загрузки
 */
export interface ResumeInfo {
  /** Нужно ли возобновлять */
  shouldResume: boolean;
  /** Позиция для начала загрузки */
  startFrom: number;
  /** ETag для валидации */
  etag?: string;
  /** Last-Modified для валидации */
  lastModified?: string;
}
