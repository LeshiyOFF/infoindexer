"use strict";
/**
 * Экспорт доменных сервисов
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationService = exports.CheckpointManager = exports.SyncOrchestrator = exports.ColumnMapper = void 0;
var column_mapper_service_1 = require("./column-mapper.service");
Object.defineProperty(exports, "ColumnMapper", { enumerable: true, get: function () { return column_mapper_service_1.ColumnMapper; } });
var sync_orchestrator_service_1 = require("./sync-orchestrator.service");
Object.defineProperty(exports, "SyncOrchestrator", { enumerable: true, get: function () { return sync_orchestrator_service_1.SyncOrchestrator; } });
var checkpoint_manager_service_1 = require("./checkpoint-manager.service");
Object.defineProperty(exports, "CheckpointManager", { enumerable: true, get: function () { return checkpoint_manager_service_1.CheckpointManager; } });
var migration_service_1 = require("./migration.service");
Object.defineProperty(exports, "MigrationService", { enumerable: true, get: function () { return migration_service_1.MigrationService; } });
