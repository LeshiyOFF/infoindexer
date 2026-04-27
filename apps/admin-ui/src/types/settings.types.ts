/**
 * Типы для модуля настроек
 *
 * @remarks
 * Общие типы для страницы настроек и связанных компонентов.
 */

/**
 * Статус синхронизации за конкретный год
 */
export interface YearStatus {
  readonly status: string;
  readonly percentage: number;
  readonly rows_processed?: number;
  readonly error?: string;
  readonly completed_at?: string;
}

/**
 * Статус синхронизации ЕГРЮЛ
 */
export interface EgrulStatus {
  readonly status: string;
  readonly percentage?: number;
  readonly message?: string;
  readonly error?: string;
  readonly rows_processed?: number;
  readonly completed_at?: string;
}

/**
 * Статус синхронизации Санкций
 */
export interface SanctionsStatus {
  readonly status: string;
  readonly percentage?: number;
  readonly message?: string;
  readonly error?: string;
  readonly completed_at?: string;
}

/**
 * Статус обновления кэша
 */
export interface RefreshSummaryStatus {
  readonly status: string;
  readonly percentage?: number;
  readonly message?: string;
  readonly error?: string;
  readonly rows?: number;
  readonly elapsedMs?: number;
  readonly completed_at?: string;
}

/**
 * Статистика системы
 */
export interface Stats {
  readonly totalRecords: number;
  readonly companiesGirBo: number;
  readonly companiesEgrul: number;
  readonly redisMemory: string;
}

/**
 * Все статусы синхронизации
 */
export type SyncStatuses = Record<string, YearStatus | EgrulStatus | SanctionsStatus | RefreshSummaryStatus>;
