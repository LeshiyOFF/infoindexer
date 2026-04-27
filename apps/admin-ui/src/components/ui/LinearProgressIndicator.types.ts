/**
 * Типы для LinearProgressIndicator
 */

/**
 * Статус прогресса
 *
 * @remarks
 * - idle: нет активной операции
 * - running: активная операция
 * - stopping: процесс остановки (indeterminate прогресс)
 * - paused: операция на паузе
 * - completed: успешно завершено
 * - error: ошибка операции
 * - deleting: удаление данных (indeterminate прогресс)
 */
export type ProgressStatus = 'idle' | 'running' | 'stopping' | 'paused' | 'completed' | 'error' | 'deleting';

/**
 * Данные прогресса
 */
export interface ProgressData {
  readonly status: ProgressStatus;
  readonly percentage?: number; // Опционально для indeterminate режима
  readonly rowsProcessed?: number;
  readonly totalRows?: number;
  readonly speed?: number; // rows/sec
  readonly eta?: number; // seconds
  readonly message?: string;
  readonly error?: string;
  readonly completedAt?: string;
  readonly indeterminate?: boolean; // Принудительный indeterminate режим
}

/**
 * Props компонента
 */
export interface LinearProgressIndicatorProps {
  readonly data: ProgressData;
  readonly showPercentage?: boolean;
  readonly className?: string;
}
