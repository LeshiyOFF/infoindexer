/**
 * Redis адаптер для отмены операций
 *
 * @remarks
 * Публикует команды отмены в Redis Pub/Sub.
 * Реализует порт IAbortHandler.
 */
import type { Redis } from 'ioredis';
import type { IAbortHandler } from '../ports/abort.port';
/**
 * Каналы Redis для отмены операций
 */
export declare const ABORT_CHANNELS: {
    readonly financialSync: "sync:abort";
    readonly egrulSync: "sync:egrul:abort";
    readonly sanctionsSync: "sync:sanctions:abort";
    readonly summaryRefresh: "refresh-summary:abort";
};
/**
 * Redis адаптер для отмены операций
 */
export declare class RedisAbortAdapter implements IAbortHandler {
    private readonly redis;
    constructor(redis: Redis);
    /**
     * Отменяет операцию через Redis Pub/Sub
     */
    abort(operationId: string): Promise<{
        success: boolean;
        message?: string;
        error?: string;
    }>;
    /**
     * Определяет тип операции по ID
     */
    private detectOperationType;
    /**
     * Возвращает канал для типа операции
     */
    private getChannelForType;
}
