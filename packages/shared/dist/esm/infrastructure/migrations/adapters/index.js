"use strict";
/**
 * Migration Adapters Index
 *
 * @remarks
 * Экспортирует все адаптеры модуля миграций.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisDistributedLockAdapter = exports.UnifiedMigrationAdapter = exports.ClickHouseMigrationAdapter = void 0;
var clickhouse_migration_adapter_1 = require("./clickhouse/clickhouse-migration.adapter");
Object.defineProperty(exports, "ClickHouseMigrationAdapter", { enumerable: true, get: function () { return clickhouse_migration_adapter_1.ClickHouseMigrationAdapter; } });
var unified_migration_adapter_1 = require("./clickhouse/unified-migration.adapter");
Object.defineProperty(exports, "UnifiedMigrationAdapter", { enumerable: true, get: function () { return unified_migration_adapter_1.UnifiedMigrationAdapter; } });
var redis_distributed_lock_adapter_1 = require("./redis-distributed-lock.adapter");
Object.defineProperty(exports, "RedisDistributedLockAdapter", { enumerable: true, get: function () { return redis_distributed_lock_adapter_1.RedisDistributedLockAdapter; } });
