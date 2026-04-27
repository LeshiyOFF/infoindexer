"use strict";
/**
 * Константы для EGRUL Sync Worker
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENRICHMENT_RATE_LIMIT_DELAY = exports.ENRICHMENT_MIN_CONFIDENCE = exports.ENRICHMENT_MAX_DISTANCE = exports.ENRICHMENT_BATCH_SIZE = exports.PROGRESS_MAJOR_REPORT_INTERVAL = exports.PROGRESS_REPORT_INTERVAL = exports.DEFAULT_BATCH_SIZE = exports.RETRY_DELAY_MS = exports.PROXY_RETRIES = void 0;
exports.PROXY_RETRIES = 6;
exports.RETRY_DELAY_MS = 3000;
exports.DEFAULT_BATCH_SIZE = 100000;
exports.PROGRESS_REPORT_INTERVAL = 100000;
exports.PROGRESS_MAJOR_REPORT_INTERVAL = 500000;
// Phase B: External Enrichment
exports.ENRICHMENT_BATCH_SIZE = 100;
exports.ENRICHMENT_MAX_DISTANCE = 3;
exports.ENRICHMENT_MIN_CONFIDENCE = 0.7;
exports.ENRICHMENT_RATE_LIMIT_DELAY = 100;
