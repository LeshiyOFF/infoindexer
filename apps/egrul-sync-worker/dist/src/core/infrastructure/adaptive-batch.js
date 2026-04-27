"use strict";
/**
 * Adaptive Batch Writer
 *
 * Адаптивно меняет размер батча на основе производительности.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdaptiveBatchWriter = void 0;
exports.createBatchWriter = createBatchWriter;
const adaptive_batch_config_1 = require("./adaptive-batch-config");
const adaptive_batch_metrics_1 = require("./adaptive-batch-metrics");
const adaptive_batch_adjuster_1 = require("./adaptive-batch-adjuster");
/**
 * Адаптивный батч-райтер
 */
class AdaptiveBatchWriter {
    config;
    metrics;
    adjuster;
    constructor(config = adaptive_batch_config_1.DEFAULT_BATCH_CONFIG, now = Date.now) {
        this.config = config;
        this.metrics = new adaptive_batch_metrics_1.BatchMetricsTracker(config.metricsWindowSize, now);
        this.adjuster = new adaptive_batch_adjuster_1.BatchSizeAdjuster(config);
    }
    /** Текущий размер батча */
    get batchSize() {
        return this.adjuster.currentSize;
    }
    /** Добавляет элементы и выполняет батч */
    async add(items, fn) {
        if (items.length === 0)
            return;
        const startTime = this.metrics.now();
        let success = false;
        try {
            await fn(items);
            success = true;
        }
        finally {
            const duration = this.metrics.now() - startTime;
            this.metrics.record(items.length, duration, success, startTime);
            this.adjuster.adapt(duration, success, this.metrics.getAverageDuration());
        }
    }
    /** Статистика работы */
    getStats() {
        return {
            currentBatchSize: this.adjuster.currentSize,
            totalProcessed: this.metrics.totalProcessed,
            totalBatches: this.metrics.totalBatches,
            successRate: this.metrics.successRate,
            averageDuration: this.metrics.getAverageDuration()
        };
    }
    /** Сбрасывает статистику */
    reset() {
        this.metrics.reset();
        this.adjuster.reset();
    }
    /** Новый writer с изменённой конфигурацией */
    withConfig(partialConfig) {
        return new AdaptiveBatchWriter({ ...this.config, ...partialConfig }, this.metrics.now);
    }
}
exports.AdaptiveBatchWriter = AdaptiveBatchWriter;
/** Factory для создания типизированного batch writer */
function createBatchWriter(config) {
    return new AdaptiveBatchWriter(config);
}
__exportStar(require("./adaptive-batch-types"), exports);
__exportStar(require("./adaptive-batch-config"), exports);
