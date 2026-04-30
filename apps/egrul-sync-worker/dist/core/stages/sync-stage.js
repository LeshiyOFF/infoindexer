"use strict";
/**
 * Base Sync Stage
 *
 * Базовый класс для всех stage синхронизации.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseSyncStage = void 0;
const stage_context_1 = require("./stage-context");
const sync_stage_reporter_1 = require("./sync-stage-reporter");
/**
 * Базовый абстрактный класс для stage синхронизации
 */
class BaseSyncStage {
    context;
    reporter;
    constructor(context) {
        this.context = context;
        this.reporter = new sync_stage_reporter_1.SyncStageReporter(context.reporter);
    }
    /**
     * Выполняет stage с обработкой ошибок и progress reporting
     */
    async execute(options = {}) {
        const { onProgress, skipErrors = false } = options;
        try {
            const metadata = this.getMetadata();
            await this.reporter.reportStart(metadata);
            const result = await this.runInternal({
                ...options,
                onProgress: (progress, message) => {
                    const adjustedProgress = this.adjustProgress(progress, metadata);
                    onProgress?.(adjustedProgress, message);
                    this.reporter.throttledReport(metadata, adjustedProgress, message);
                }
            });
            if ((0, stage_context_1.isStageFailure)(result) && !skipErrors) {
                await this.reporter.reportError(metadata, result.error, result.code);
                return result;
            }
            await this.reporter.reportComplete(metadata, result);
            return result;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const code = error instanceof Error ? error.name : 'UNKNOWN_ERROR';
            const metadata = this.getMetadata();
            await this.reporter.reportError(metadata, errorMessage, code);
            return (0, stage_context_1.stageFailure)(errorMessage, code);
        }
    }
    /**
     * Выполняет HTTP запрос с circuit breaker и retry
     */
    async executeWithResilience(fn, operation) {
        const retryResult = await this.context.retryPolicy.execute(async () => {
            const circuitResult = await this.context.circuitBreaker.execute(fn);
            if (!circuitResult.success) {
                throw new Error(circuitResult.error);
            }
            return circuitResult.value;
        });
        if (!retryResult.success) {
            throw retryResult.error;
        }
        return retryResult.value;
    }
    /**
     * Проверяет, является ли ошибка повторяемой
     */
    isRetryable(error) {
        if (error instanceof Error) {
            const retryableMessages = [
                'ECONNRESET',
                'ETIMEDOUT',
                'ENOTFOUND',
                'EAI_AGAIN',
                'socket hang up',
                'timeout'
            ];
            return retryableMessages.some(msg => error.message.includes(msg));
        }
        return false;
    }
    /**
     * Корректирует процент выполнения в диапазоне stage
     */
    adjustProgress(progress, metadata) {
        const range = metadata.endPercentage - metadata.startPercentage;
        return metadata.startPercentage + (range * progress / 100);
    }
}
exports.BaseSyncStage = BaseSyncStage;
