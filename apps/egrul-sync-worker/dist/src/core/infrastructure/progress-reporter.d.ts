import { Redis } from 'ioredis';
/**
 * Состояние прогресса синхронизации EGRUL
 */
export interface EgrulProgressState {
    status: string;
    percentage?: number;
    message?: string;
    error?: string;
    updated_at?: string;
    completed_at?: string;
    rows_processed?: number;
}
/**
 * Reporter для отправки прогресса в Redis
 */
export declare class ProgressReporter {
    private readonly redis;
    private readonly channel;
    constructor(redis: Redis, channel?: string);
    /**
     * Отправляет состояние прогресса в Redis
     *
     * @param state - Состояние прогресса
     */
    report(state: EgrulProgressState): Promise<void>;
    /**
     * Создаёт состояние с заданным статусом
     *
     * @param status - Статус операции
     * @param percentage - Процент выполнения
     * @param message - Сообщение
     * @param rowsProcessed - Обработано строк
     * @returns Состояние прогресса
     */
    createState(status: string, percentage?: number, message?: string, rowsProcessed?: number): EgrulProgressState;
}
/**
 * Фабрика для создания ProgressReporter
 */
export declare class ProgressReporterFactory {
    private static egrulInstance;
    private static sanctionsInstance;
    /**
     * Создаёт репортёр для синхронизации ЕГРЮЛ
     */
    static create(redis: Redis): ProgressReporter;
    /**
     * Создаёт репортёр для синхронизации санкций
     */
    static createForSanctions(redis?: Redis): ProgressReporter;
}
