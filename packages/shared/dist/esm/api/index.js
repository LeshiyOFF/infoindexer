"use strict";
/**
 * API Module Exports
 *
 * Централизованный экспорт всех API типов и контрактов.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_SYNC_CONFIG = exports.calculateStagePercentage = exports.createSyncStatus = exports.SyncStage = exports.ApiErrorCode = exports.apiPaginated = exports.apiError = exports.apiSuccess = void 0;
var responses_1 = require("./responses");
Object.defineProperty(exports, "apiSuccess", { enumerable: true, get: function () { return responses_1.apiSuccess; } });
Object.defineProperty(exports, "apiError", { enumerable: true, get: function () { return responses_1.apiError; } });
Object.defineProperty(exports, "apiPaginated", { enumerable: true, get: function () { return responses_1.apiPaginated; } });
var responses_2 = require("./responses");
Object.defineProperty(exports, "ApiErrorCode", { enumerable: true, get: function () { return responses_2.ApiErrorCode; } });
// Sync types
var sync_types_1 = require("./sync.types");
Object.defineProperty(exports, "SyncStage", { enumerable: true, get: function () { return sync_types_1.SyncStage; } });
Object.defineProperty(exports, "createSyncStatus", { enumerable: true, get: function () { return sync_types_1.createSyncStatus; } });
Object.defineProperty(exports, "calculateStagePercentage", { enumerable: true, get: function () { return sync_types_1.calculateStagePercentage; } });
Object.defineProperty(exports, "DEFAULT_SYNC_CONFIG", { enumerable: true, get: function () { return sync_types_1.DEFAULT_SYNC_CONFIG; } });
