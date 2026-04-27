"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrichmentWorkerFactory = exports.EnrichmentWorker = void 0;
const shared_1 = require("shared");
/**
 * Worker для фонового обогащения данных
 * Работает независимо от основного процесса синхронизации
 */
class EnrichmentWorker {
    enrichment;
    progress;
    redisChannel;
    isRunning = false;
    constructor(enrichment, progress, redisChannel = 'sync:enrichment:start') {
        this.enrichment = enrichment;
        this.progress = progress;
        this.redisChannel = redisChannel;
    }
    /**
     * Запускает worker
     */
    start() {
        if (this.isRunning) {
            console.log('EnrichmentWorker already running');
            return;
        }
        this.isRunning = true;
        this.subscribe();
        console.log(`EnrichmentWorker started, listening on [${this.redisChannel}]`);
    }
    /**
     * Останавливает worker
     */
    stop() {
        this.isRunning = false;
        console.log('EnrichmentWorker stopped');
    }
    /**
     * Подписывается на Redis канал
     */
    subscribe() {
        shared_1.redisSub.subscribe(this.redisChannel, (err) => {
            if (err) {
                console.error(`Failed to subscribe to ${this.redisChannel}:`, err);
            }
            else {
                console.log(`EnrichmentWorker: Subscribed to channel [${this.redisChannel}]`);
            }
        });
        shared_1.redisSub.on('message', async (channel, message) => {
            if (channel === this.redisChannel && this.isRunning) {
                console.log(`EnrichmentWorker received command: [${message}]`);
                try {
                    await this.execute();
                }
                catch (error) {
                    console.error('EnrichmentWorker error:', error);
                    await this.progress.report({
                        status: 'error',
                        error: error instanceof Error ? error.message : String(error),
                        message: `Ошибка обогащения: ${error}`,
                        updated_at: new Date().toISOString()
                    });
                }
            }
        });
    }
    /**
     * Выполняет enrichment
     */
    async execute() {
        const startTime = Date.now();
        await this.progress.report({
            status: 'running',
            percentage: 0,
            message: 'Запуск обогащения данных...',
            updated_at: new Date().toISOString()
        });
        const result = await this.enrichment.enrichUnmappedInns();
        const duration = Date.now() - startTime;
        await this.progress.report({
            status: 'completed',
            percentage: 100,
            message: `Обогащение завершено: ${result.matched}/${result.processed} совпадений за ${duration}ms`,
            updated_at: new Date().toISOString()
        });
        console.log(`EnrichmentWorker: Completed in ${duration}ms`);
    }
}
exports.EnrichmentWorker = EnrichmentWorker;
/**
 * Фабрика для создания EnrichmentWorker
 */
class EnrichmentWorkerFactory {
    static instance = null;
    static create(enrichment, progress) {
        if (!this.instance) {
            this.instance = new EnrichmentWorker(enrichment, progress);
        }
        return this.instance;
    }
    static getInstance() {
        return this.instance;
    }
}
exports.EnrichmentWorkerFactory = EnrichmentWorkerFactory;
