"use strict";
/**
 * Factory для создания ClickHouse адаптеров
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickHouseMigrationAdapter = exports.ClickHouseStorageAdapter = void 0;
var clickhouse_storage_adapter_1 = require("./clickhouse-storage.adapter");
Object.defineProperty(exports, "ClickHouseStorageAdapter", { enumerable: true, get: function () { return clickhouse_storage_adapter_1.ClickHouseStorageAdapter; } });
var clickhouse_migration_adapter_1 = require("./clickhouse-migration.adapter");
Object.defineProperty(exports, "ClickHouseMigrationAdapter", { enumerable: true, get: function () { return clickhouse_migration_adapter_1.ClickHouseMigrationAdapter; } });
