"use strict";
/**
 * Migration Domain Services Index
 *
 * @remarks
 * Экспортирует все Domain Services модуля миграций.
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
exports.LEGACY_MIGRATION_DESCRIPTORS = exports.MigrationApplierService = exports.MigrationDiscovererService = exports.UnifiedMigrationService = void 0;
var unified_migration_service_1 = require("./unified-migration.service");
Object.defineProperty(exports, "UnifiedMigrationService", { enumerable: true, get: function () { return unified_migration_service_1.UnifiedMigrationService; } });
var migration_discoverer_service_1 = require("./migration-discoverer.service");
Object.defineProperty(exports, "MigrationDiscovererService", { enumerable: true, get: function () { return migration_discoverer_service_1.MigrationDiscovererService; } });
var migration_applier_service_1 = require("./migration-applier.service");
Object.defineProperty(exports, "MigrationApplierService", { enumerable: true, get: function () { return migration_applier_service_1.MigrationApplierService; } });
var legacy_migration_descriptors_1 = require("./legacy/legacy-migration-descriptors");
Object.defineProperty(exports, "LEGACY_MIGRATION_DESCRIPTORS", { enumerable: true, get: function () { return legacy_migration_descriptors_1.LEGACY_MIGRATION_DESCRIPTORS; } });
__exportStar(require("./parsers"), exports);
