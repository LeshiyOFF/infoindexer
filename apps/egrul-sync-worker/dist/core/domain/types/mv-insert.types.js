"use strict";
/**
 * MV Insert Types
 *
 * @remarks
 * Type definitions for Materialized View insert operations.
 * Following DRY: single source of truth for MV insert types.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_MV_INSERT_CONFIG = void 0;
/**
 * Default MV insert configuration
 */
exports.DEFAULT_MV_INSERT_CONFIG = {
    batchSize: 1000,
    maxConcurrent: 3,
    timeoutMs: 300000
};
