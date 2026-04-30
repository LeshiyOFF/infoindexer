"use strict";
/**
 * Adaptive Batch Writer Configuration
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_BATCH_CONFIG = void 0;
/**
 * Значения по умолчанию
 */
exports.DEFAULT_BATCH_CONFIG = {
    initialBatchSize: 100,
    minBatchSize: 10,
    maxBatchSize: 1000,
    targetDuration: 1000,
    growthFactor: 1.5,
    decayFactor: 0.5,
    metricsWindowSize: 5
};
