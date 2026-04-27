/**
 * Port для отчёта о прогрессе синхронизации
 *
 * @remarks
 * Абстракция над хранилищем статуса синхронизации.
 */
import type { SyncProgress } from '../types';
/**
 * Port для отчёта о прогрессе
 */
export interface IProgressReporter {
    /**
     * Сохраняет прогресс синхронизации
     */
    report(year: number, progress: SyncProgress): Promise<void>;
    /**
     * Удаляет информацию об ошибке
     */
    clearError(year: number): Promise<void>;
}
