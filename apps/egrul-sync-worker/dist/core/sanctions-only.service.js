"use strict";
/**
 * Sanctions Only Sync Service
 *
 * Сервис для синхронизации только санкций из OpenSanctions
 * без полной перезагрузки данных ЕГРЮЛ.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SanctionsOnlyService = void 0;
const sanctions_sync_stage_1 = require("./stages/sanctions-sync.stage");
const circuit_breaker_1 = require("./infrastructure/circuit-breaker");
const retry_1 = require("./infrastructure/retry");
const progress_reporter_1 = require("./infrastructure/progress-reporter");
const shared_1 = require("shared");
/**
 * Сервис для синхронизации только санкций
 *
 * Позволяет обновить данные санкций без полной перезагрузки ЕГРЮЛ.
 */
class SanctionsOnlyService {
    repository;
    parser;
    httpClient;
    circuitBreaker;
    retryPolicy;
    constructor(repository, parser, httpClient) {
        this.repository = repository;
        this.parser = parser;
        this.httpClient = httpClient;
        this.circuitBreaker = new circuit_breaker_1.CircuitBreaker({
            failureThreshold: 3,
            halfOpenTimeout: 60000,
            openTimeout: 30000,
            slidingWindowSize: 10000
        });
        this.retryPolicy = new retry_1.RetryPolicy({
            maxAttempts: 3,
            baseDelay: 1000,
            maxDelay: 30000,
            strategy: 'exponential',
            multiplier: 2,
            jitter: 0.1
        });
    }
    /**
     * Выполняет синхронизацию только санкций
     *
     * @param config - опциональная конфигурация
     * @returns результат синхронизации
     */
    async run(config = {}) {
        const { abortSignal } = config;
        // Проверяем abort перед началом операции
        if (abortSignal?.aborted) {
            return {
                status: 'error',
                processed: 0,
                errors: 0,
                message: 'Операция отменена'
            };
        }
        const progressReporter = progress_reporter_1.ProgressReporterFactory.createForSanctions();
        try {
            // Создаём stage для синхронизации санкций
            const stage = new sanctions_sync_stage_1.SanctionsSyncStage({
                reporter: progressReporter,
                circuitBreaker: this.circuitBreaker,
                retryPolicy: this.retryPolicy,
                startTime: new Date()
            }, this.repository, this.parser, this.httpClient, config);
            // Запускаем выполнение stage
            const result = await stage.execute({
                skipErrors: false,
                abortSignal,
                onProgress: (percentage, message) => {
                    // Отчёт о прогрессе через ProgressReporter
                    console.log(`[Sanctions Sync] ${percentage}% - ${message}`);
                }
            });
            if (result.success) {
                // Триггерим обновление кэша после успешной загрузки санкций
                await this.triggerCacheRefresh();
                return {
                    status: 'completed',
                    processed: result.processed,
                    errors: 0,
                    message: result.message ?? 'Синхронизация завершена'
                };
            }
            else {
                return {
                    status: 'error',
                    processed: 0,
                    errors: 1,
                    message: result.error ?? 'Ошибка синхронизации'
                };
            }
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            // Если abort - удаляем частичные данные
            if (message === 'Sanctions sync aborted' || message === 'Operation aborted') {
                await this.handleAbort(progressReporter);
            }
            return {
                status: 'error',
                processed: 0,
                errors: 1,
                message
            };
        }
    }
    /**
     * Триггерит асинхронное обновление кэша через Redis pub/sub
     */
    async triggerCacheRefresh() {
        try {
            await shared_1.redisPub.publish('sync:refresh:start', JSON.stringify({
                timestamp: new Date().toISOString(),
                trigger: 'sanctions_sync'
            }));
            console.log('[Sanctions Sync] Cache refresh triggered');
        }
        catch (error) {
            console.warn('[Sanctions Sync] Failed to trigger cache refresh:', error);
        }
    }
    /**
     * Обрабатывает abort синхронизации санкций
     *
     * @remarks
     * 1. Сообщает статус 'deleting'
     * 2. Удаляет частично загруженные данные
     * 3. Сообщает статус 'idle'
     */
    async handleAbort(progressReporter) {
        console.log('Handling Sanctions sync abort...');
        await progressReporter.report(progressReporter.createState('deleting', 0, 'Удаление частично загруженных данных...'));
        await this.repository.deleteAll();
        await progressReporter.report(progressReporter.createState('idle', 0, 'Операция отменена'));
        console.log('Sanctions sync abort handled');
    }
}
exports.SanctionsOnlyService = SanctionsOnlyService;
