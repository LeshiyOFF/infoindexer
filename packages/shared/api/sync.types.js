"use strict";
/**
 * Sync Types
 *
 * Типы для синхронизации данных (EGRUL + Sanctions)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_SYNC_CONFIG = exports.SyncStage = void 0;
exports.createSyncStatus = createSyncStatus;
exports.calculateStagePercentage = calculateStagePercentage;
/**
 * Стадии синхронизации
 */
var SyncStage;
(function (SyncStage) {
    SyncStage["IDLE"] = "idle";
    // EGRUL stages (0-40%)
    SyncStage["EGRUL_DOWNLOAD"] = "egrul_download";
    SyncStage["EGRUL_PARSE"] = "egrul_parse";
    // Sanctions stages (40-70%)
    SyncStage["SANCTIONS_DOWNLOAD"] = "sanctions_download";
    SyncStage["SANCTIONS_PARSE"] = "sanctions_parse";
    // Merge stages (70-90%)
    SyncStage["MERGE_COMPANIES"] = "merge_companies";
    SyncStage["MERGE_SANCTIONS"] = "merge_sanctions";
    // Cleanup (90-100%)
    SyncStage["CLEANUP"] = "cleanup";
    SyncStage["COMPLETED"] = "completed";
    SyncStage["ERROR"] = "error";
})(SyncStage || (exports.SyncStage = SyncStage = {}));
/**
 * Значения конфигурации по умолчанию
 */
exports.DEFAULT_SYNC_CONFIG = {
    batchSize: 1000,
    maxRetries: 3,
    timeout: 30000,
    skipExisting: false
};
/**
 * Создаёт данные статуса синхронизации
 */
function createSyncStatus(status, stage, message, percentage, startedAt, error) {
    return {
        status,
        stage,
        ...(percentage !== undefined && { percentage: Math.max(0, Math.min(100, percentage)) }),
        message,
        ...(startedAt && { startedAt }),
        ...(status === 'completed' && { completedAt: new Date().toISOString() }),
        ...(error && { error })
    };
}
/**
 * Вычисляет процент выполнения по стадии
 */
function calculateStagePercentage(stage) {
    const stageWeights = {
        [SyncStage.IDLE]: 0,
        [SyncStage.EGRUL_DOWNLOAD]: 5,
        [SyncStage.EGRUL_PARSE]: 20,
        [SyncStage.SANCTIONS_DOWNLOAD]: 25,
        [SyncStage.SANCTIONS_PARSE]: 40,
        [SyncStage.MERGE_COMPANIES]: 70,
        [SyncStage.MERGE_SANCTIONS]: 85,
        [SyncStage.CLEANUP]: 95,
        [SyncStage.COMPLETED]: 100,
        [SyncStage.ERROR]: 0
    };
    return stageWeights[stage];
}
