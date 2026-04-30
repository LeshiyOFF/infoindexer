"use strict";
/**
 * Migration Value Objects Index
 *
 * @remarks
 * Экспортирует все Value Objects модуля миграций.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeStats = exports.updateStats = exports.createInitialStats = exports.createFailureResult = exports.createSuccessResult = exports.MetadataFormat = exports.MigrationMetadata = exports.createMigrationDescriptor = void 0;
var migration_descriptor_vo_1 = require("./migration-descriptor.vo");
Object.defineProperty(exports, "createMigrationDescriptor", { enumerable: true, get: function () { return migration_descriptor_vo_1.createMigrationDescriptor; } });
var migration_metadata_vo_1 = require("./migration-metadata.vo");
Object.defineProperty(exports, "MigrationMetadata", { enumerable: true, get: function () { return migration_metadata_vo_1.MigrationMetadata; } });
Object.defineProperty(exports, "MetadataFormat", { enumerable: true, get: function () { return migration_metadata_vo_1.MetadataFormat; } });
// MigrationResult импортируется из ports/i-migration-runner.port.ts
var migration_result_vo_1 = require("./migration-result.vo");
Object.defineProperty(exports, "createSuccessResult", { enumerable: true, get: function () { return migration_result_vo_1.createSuccessResult; } });
Object.defineProperty(exports, "createFailureResult", { enumerable: true, get: function () { return migration_result_vo_1.createFailureResult; } });
var migration_stats_vo_1 = require("./migration-stats.vo");
Object.defineProperty(exports, "createInitialStats", { enumerable: true, get: function () { return migration_stats_vo_1.createInitialStats; } });
Object.defineProperty(exports, "updateStats", { enumerable: true, get: function () { return migration_stats_vo_1.updateStats; } });
Object.defineProperty(exports, "mergeStats", { enumerable: true, get: function () { return migration_stats_vo_1.mergeStats; } });
