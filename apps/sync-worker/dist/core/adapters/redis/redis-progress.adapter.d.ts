/**
 * Адаптер для отчёта о прогрессе через Redis
 *
 * @remarks
 * Реализует IProgressReporter порт с помощью Redis.
 */
import type { Redis } from 'ioredis';
import type { IProgressReporter } from '../../ports';
import type { SyncProgress } from '../../types';
/**
 * Адаптер для отчёта о прогрессе через Redis
 */
export declare class RedisProgressAdapter implements IProgressReporter {
    private readonly redis;
    constructor(redis: Redis);
    /**
     * Сохраняет прогресс синхронизации
     */
    report(year: number, progress: SyncProgress): Promise<void>;
    /**
     * Удаляет информацию об ошибке
     */
    clearError(year: number): Promise<void>;
}
