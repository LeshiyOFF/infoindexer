"use strict";
/**
 * Unified Migration Module Index
 *
 * @remarks
 * Экспортирует все публичные API модуля миграций.
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
exports.createUnifiedMigrationService = exports.createClickHouseMigrationAdapter = exports.createUnifiedMigrationOrchestrator = void 0;
// Ports
__exportStar(require("./ports"), exports);
// Domain
__exportStar(require("./domain"), exports);
// Adapters
__exportStar(require("./adapters"), exports);
var unified_migration_factory_1 = require("./factories/unified-migration.factory");
Object.defineProperty(exports, "createUnifiedMigrationOrchestrator", { enumerable: true, get: function () { return unified_migration_factory_1.createUnifiedMigrationOrchestrator; } });
Object.defineProperty(exports, "createClickHouseMigrationAdapter", { enumerable: true, get: function () { return unified_migration_factory_1.createClickHouseMigrationAdapter; } });
Object.defineProperty(exports, "createUnifiedMigrationService", { enumerable: true, get: function () { return unified_migration_factory_1.createUnifiedMigrationService; } });
