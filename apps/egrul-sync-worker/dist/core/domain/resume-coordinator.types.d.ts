/**
 * Типы для Resume Coordinator
 *
 * @remarks
 * Константы и DTO для HTTP Range resume.
 * Вынесены в отдельный файл для соблюдения лимита 200 строк.
 */
/** Максимальный возраст состояния (24 часа) */
export declare const MAX_STATE_AGE_MS: number;
/** Интервал сохранения состояния (10 MB) */
export declare const SAVE_INTERVAL_BYTES: number;
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
