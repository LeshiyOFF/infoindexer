"use strict";
/**
 * Shared Package - Client-safe exports
 *
 * Экспортирует только типы и константы, безопасные для использования в браузере.
 * НЕ экспортирует redis, clickhouse и другие Node.js зависимости.
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
exports.DEFAULT_SYNC_CONFIG = exports.calculateStagePercentage = exports.createSyncStatus = exports.SyncStage = exports.ApiErrorCode = exports.apiPaginated = exports.apiError = exports.apiSuccess = void 0;
// Core types
__exportStar(require("./interfaces"), exports);
// Domain Layer (только типы, без runtime зависимостей)
__exportStar(require("./domain"), exports);
// Result Type
__exportStar(require("./result"), exports);
// Domain Errors
__exportStar(require("./errors"), exports);
// API Types & Contracts (только типы и pure functions)
var api_1 = require("./api");
Object.defineProperty(exports, "apiSuccess", { enumerable: true, get: function () { return api_1.apiSuccess; } });
Object.defineProperty(exports, "apiError", { enumerable: true, get: function () { return api_1.apiError; } });
Object.defineProperty(exports, "apiPaginated", { enumerable: true, get: function () { return api_1.apiPaginated; } });
Object.defineProperty(exports, "ApiErrorCode", { enumerable: true, get: function () { return api_1.ApiErrorCode; } });
Object.defineProperty(exports, "SyncStage", { enumerable: true, get: function () { return api_1.SyncStage; } });
Object.defineProperty(exports, "createSyncStatus", { enumerable: true, get: function () { return api_1.createSyncStatus; } });
Object.defineProperty(exports, "calculateStagePercentage", { enumerable: true, get: function () { return api_1.calculateStagePercentage; } });
Object.defineProperty(exports, "DEFAULT_SYNC_CONFIG", { enumerable: true, get: function () { return api_1.DEFAULT_SYNC_CONFIG; } });
// Repository Interfaces (Ports)
__exportStar(require("./repositories"), exports);
// Services (pure functions только)
__exportStar(require("./financial-reports"), exports);
