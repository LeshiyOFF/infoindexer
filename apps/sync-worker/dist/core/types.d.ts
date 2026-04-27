/**
 * Доменные типы для sync-worker
 *
 * @remarks
 * Содержит типы для синхронизации financial reports.
 * Не зависит от конкретных реализаций инфраструктуры.
 */
/**
 * Статус синхронизации
 *
 * @remarks
 * - running: активная синхронизация
 * - aborting: процесс остановки (удаление частично загруженных данных)
 * - idle: нет активной синхронизации
 * - completed: успешно завершено
 * - error: ошибка синхронизации
 * - aborted: прервано пользователем
 * - deleting: удаление данных
 */
export type SyncStatus = 'idle' | 'running' | 'aborting' | 'completed' | 'error' | 'aborted' | 'deleting';
/**
 * Прогресс синхронизации
 */
export interface SyncProgress {
    readonly status: SyncStatus;
    readonly percentage: number;
    readonly rows_processed: number;
    readonly completed_at?: string;
    readonly error?: string;
    readonly timestamp?: string;
}
/**
 * Описание колонки для маппинга типов
 */
export interface ColumnDescription {
    readonly name: string;
    readonly duckdbType: string;
    readonly clickhouseType: string;
}
/**
 * Определение колонки для CREATE TABLE
 */
export interface ColumnDefinition {
    readonly name: string;
    readonly type: string;
}
/**
 * Строка financial report для вставки в ClickHouse
 */
export interface FinancialReportRow {
    readonly inn?: string | null;
    readonly [key: string]: string | number | null | undefined;
}
/**
 * Результат подсчёта строк
 */
export interface CountResult {
    readonly total: number | bigint;
}
/**
 * Raw строка из Parquet
 */
export interface ParquetRow {
    readonly [key: string]: string | number | Date | bigint | null;
}
/**
 * Сообщение для старта синхронизации
 */
export interface SyncStartMessage {
    readonly year: number;
}
/**
 * Сообщение для прерывания синхронизации
 */
export interface SyncAbortMessage {
    readonly year: number;
}
/**
 * Ошибка прерывания синхронизации
 */
export declare class SyncAbortedError extends Error {
    constructor();
}
/**
 * Конфигурация синхронизации
 */
export interface SyncConfig {
    readonly batchSize: number;
    readonly reportInterval: number;
}
