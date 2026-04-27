/**
 * Redis адаптер для отмены операций
 *
 * @remarks
 * Публикует команды отмены в Redis Pub/Sub.
 * Реализует порт IAbortHandler.
 */
import { serializeAbortCommand } from '../../domain/abort/abort-command.dto';
/**
 * Каналы Redis для отмены операций
 */
export const ABORT_CHANNELS = {
    financialSync: 'sync:abort',
    egrulSync: 'sync:egrul:abort',
    sanctionsSync: 'sync:sanctions:abort',
    summaryRefresh: 'refresh-summary:abort'
};
/**
 * Redis адаптер для отмены операций
 */
export class RedisAbortAdapter {
    redis;
    constructor(redis) {
        this.redis = redis;
    }
    /**
     * Отменяет операцию через Redis Pub/Sub
     */
    async abort(operationId) {
        try {
            // Определяем тип операции по operationId
            const operationType = this.detectOperationType(operationId);
            const channel = this.getChannelForType(operationType);
            const command = {
                operationId,
                operationType,
                timestamp: Date.now()
            };
            await this.redis.publish(channel, serializeAbortCommand(command));
            return {
                success: true,
                message: 'Команда отмены отправлена'
            };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            return {
                success: false,
                error: message
            };
        }
    }
    /**
     * Определяет тип операции по ID
     */
    detectOperationType(operationId) {
        // Годовые данные (финансовые отчёты)
        if (/^\d{4}$/.test(operationId)) {
            return 'financial-sync';
        }
        // ЕГРЮЛ
        if (operationId === 'egrul' || operationId.startsWith('egrul:')) {
            return 'egrul-sync';
        }
        // Санкции
        if (operationId === 'sanctions' || operationId.startsWith('sanctions:')) {
            return 'sanctions-sync';
        }
        // Summary/Cache
        if (operationId === 'summary' || operationId.startsWith('summary:')) {
            return 'summary-refresh';
        }
        // По умолчанию
        return 'financial-sync';
    }
    /**
     * Возвращает канал для типа операции
     */
    getChannelForType(operationType) {
        switch (operationType) {
            case 'egrul-sync':
                return ABORT_CHANNELS.egrulSync;
            case 'sanctions-sync':
                return ABORT_CHANNELS.sanctionsSync;
            case 'summary-refresh':
                return ABORT_CHANNELS.summaryRefresh;
            default:
                return ABORT_CHANNELS.financialSync;
        }
    }
}
