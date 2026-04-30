"use strict";
/**
 * Merge Sanctions Stage
 *
 * Объединение санкций с данными компаний.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MergeSanctionsStage = void 0;
exports.createMergeSanctionsStage = createMergeSanctionsStage;
const shared_1 = require("shared");
const sync_stage_1 = require("./sync-stage");
const stage_context_1 = require("./stage-context");
/**
 * Stage для объединения санкций с компаниями
 */
class MergeSanctionsStage extends sync_stage_1.BaseSyncStage {
    sanctionsRepo;
    BATCH_SIZE = 500;
    constructor(context, sanctionsRepo) {
        super(context);
        this.sanctionsRepo = sanctionsRepo;
    }
    /**
     * Выполняет объединение санкций с компаниями
     */
    async runInternal(options) {
        try {
            const sanctionedInns = await this.sanctionsRepo.getAllInns(100000);
            if (sanctionedInns.length === 0) {
                return (0, stage_context_1.stageSuccess)(0, 'Нет санкций для объединения');
            }
            const stats = await this.processInnBatches(sanctionedInns, options.onProgress);
            return (0, stage_context_1.stageSuccess)(stats.processed, `Обработано ${stats.processed} компаний, добавлено ${stats.sanctionsAdded} санкций${stats.errors > 0 ? `, ${stats.errors} ошибок` : ''}`);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return (0, stage_context_1.stageFailure)(message, 'MERGE_SANCTIONS_FAILED');
        }
    }
    /**
     * Возвращает метаданные stage
     */
    getMetadata() {
        return {
            name: 'Объединение санкций',
            stage: shared_1.SyncStage.MERGE_SANCTIONS,
            startPercentage: 70,
            endPercentage: 85
        };
    }
    /**
     * Обрабатывает ИНН батчами
     */
    async processInnBatches(inns, onProgress) {
        const stats = {
            processed: 0,
            sanctionsAdded: 0,
            errors: 0
        };
        const totalBatches = Math.ceil(inns.length / this.BATCH_SIZE);
        let batchNumber = 0;
        for (let i = 0; i < inns.length; i += this.BATCH_SIZE) {
            const batch = inns.slice(i, i + this.BATCH_SIZE);
            batchNumber++;
            const batchResult = await this.processBatch(batch);
            stats.processed += batchResult.processed;
            stats.sanctionsAdded += batchResult.sanctionsAdded;
            stats.errors += batchResult.errors;
            const progress = (batchNumber / totalBatches) * 100;
            onProgress?.(progress, `Обработано ${stats.processed}/${inns.length} компаний`);
        }
        return stats;
    }
    /**
     * Обрабатывает батч ИНН
     */
    async processBatch(inns) {
        let processed = 0;
        let sanctionsAdded = 0;
        let errors = 0;
        for (const inn of inns) {
            try {
                const hasSanctions = await this.sanctionsRepo.exists(inn);
                if (!hasSanctions) {
                    continue;
                }
                const sanctions = await this.sanctionsRepo.findByInn(inn);
                processed++;
                sanctionsAdded += sanctions.length;
            }
            catch {
                errors++;
            }
        }
        return { processed, sanctionsAdded, errors };
    }
}
exports.MergeSanctionsStage = MergeSanctionsStage;
/**
 * Фабрика для создания MergeSanctionsStage
 */
function createMergeSanctionsStage(reporter, circuitBreaker, retryPolicy, sanctionsRepo) {
    const context = {
        reporter,
        circuitBreaker,
        retryPolicy,
        startTime: new Date()
    };
    return new MergeSanctionsStage(context, sanctionsRepo);
}
