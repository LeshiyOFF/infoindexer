"use strict";
/**
 * Sanctions Sync Stage
 *
 * Загрузка и парсинг санкций из OpenSanctions API.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SanctionsSyncStage = void 0;
exports.createSanctionsSyncStage = createSanctionsSyncStage;
const shared_1 = require("shared");
const sync_stage_1 = require("./sync-stage");
const stage_context_1 = require("./stage-context");
/**
 * Stage для загрузки санкций
 */
class SanctionsSyncStage extends sync_stage_1.BaseSyncStage {
    repository;
    parser;
    httpClient;
    config;
    constructor(context, repository, parser, httpClient, sanctionsConfig) {
        super(context);
        this.repository = repository;
        this.parser = parser;
        this.httpClient = httpClient;
        this.config = {
            apiUrl: sanctionsConfig?.apiUrl ?? 'https://api.opensanctions.org/api/search',
            batchSize: sanctionsConfig?.batchSize ?? 100,
            timeout: sanctionsConfig?.timeout ?? 30000,
            abortSignal: sanctionsConfig?.abortSignal
        };
    }
    /**
     * Выполняет загрузку и парсинг санкций
     */
    async runInternal(options) {
        let totalProcessed = 0;
        let totalErrors = 0;
        try {
            const { items } = await this.fetchSanctionsPage(1);
            if (items.length === 0) {
                return (0, stage_context_1.stageSuccess)(0, 'Нет санкций для загрузки');
            }
            const { processed, errors } = await this.processBatch(items, options);
            totalProcessed = processed;
            totalErrors = errors;
            options.onProgress?.(100, `Загружено ${totalProcessed} записей`);
            return (0, stage_context_1.stageSuccess)(totalProcessed, `Загружено ${totalProcessed} санкций${totalErrors > 0 ? `, ${totalErrors} ошибок` : ''}`);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return (0, stage_context_1.stageFailure)(message, 'SANCTIONS_SYNC_FAILED');
        }
    }
    /**
     * Возвращает метаданные stage
     */
    getMetadata() {
        return {
            name: 'Загрузка санкций',
            stage: shared_1.SyncStage.SANCTIONS_DOWNLOAD,
            startPercentage: 25,
            endPercentage: 40
        };
    }
    /**
     * Загружает страницу санкций из API
     */
    async fetchSanctionsPage(page) {
        const response = await this.executeWithResilience(() => this.httpClient.fetch(`${this.config.apiUrl}?page=${page}&limit=${this.config.batchSize}`, false), 'fetch_sanctions');
        const data = await response.data.json();
        return {
            items: data.results ?? []
        };
    }
    /**
     * Обрабатывает батч санкций
     */
    async processBatch(items, options) {
        const parsedRows = [];
        let errors = 0;
        for (const item of items) {
            // Проверяем abort при обработке каждой записи
            if (this.config.abortSignal?.aborted) {
                throw new Error('Sanctions sync aborted');
            }
            const result = this.parser.parse(item);
            if (result.isOk()) {
                parsedRows.push(result.unwrap());
            }
            else {
                errors++;
                if (!options.skipErrors) {
                    result.match({
                        ok: () => { },
                        err: (err) => { throw err; }
                    });
                }
            }
        }
        if (parsedRows.length > 0) {
            await this.repository.saveBatch(parsedRows);
        }
        return {
            processed: parsedRows.length,
            errors
        };
    }
}
exports.SanctionsSyncStage = SanctionsSyncStage;
/**
 * Фабрика для создания SanctionsSyncStage
 */
function createSanctionsSyncStage(reporter, circuitBreaker, retryPolicy, repository, parser, httpClient, sanctionsConfig) {
    const context = {
        reporter,
        circuitBreaker,
        retryPolicy,
        startTime: new Date()
    };
    return new SanctionsSyncStage(context, repository, parser, httpClient, sanctionsConfig);
}
