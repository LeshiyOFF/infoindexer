"use strict";
/**
 * Infrastructure Adapters Exports
 *
 * @remarks
 * Infrastructure Layer: Public API for adapters.
 *
 * Iteration 13: GDPR Right-to-Delete
 * Iteration 14: Rate Limiting
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRateLimitServiceWithRedis = exports.createRateLimitService = exports.RedisRateLimitAdapter = exports.getQualifiedTableName = exports.DEFAULT_DATABASE = exports.GDPR_TABLES = exports.createGdprDeletionService = exports.createClickHouseGdprDeletion = exports.ClickHouseGdprDeletionAdapter = void 0;
// GDPR Deletion
var clickhouse_gdpr_deletion_adapter_1 = require("./clickhouse-gdpr-deletion.adapter");
Object.defineProperty(exports, "ClickHouseGdprDeletionAdapter", { enumerable: true, get: function () { return clickhouse_gdpr_deletion_adapter_1.ClickHouseGdprDeletionAdapter; } });
Object.defineProperty(exports, "createClickHouseGdprDeletion", { enumerable: true, get: function () { return clickhouse_gdpr_deletion_adapter_1.createClickHouseGdprDeletion; } });
var gdpr_deletion_factory_1 = require("./gdpr-deletion.factory");
Object.defineProperty(exports, "createGdprDeletionService", { enumerable: true, get: function () { return gdpr_deletion_factory_1.createGdprDeletionService; } });
var clickhouse_gdpr_deletion_constants_1 = require("./clickhouse-gdpr-deletion.constants");
Object.defineProperty(exports, "GDPR_TABLES", { enumerable: true, get: function () { return clickhouse_gdpr_deletion_constants_1.GDPR_TABLES; } });
Object.defineProperty(exports, "DEFAULT_DATABASE", { enumerable: true, get: function () { return clickhouse_gdpr_deletion_constants_1.DEFAULT_DATABASE; } });
Object.defineProperty(exports, "getQualifiedTableName", { enumerable: true, get: function () { return clickhouse_gdpr_deletion_constants_1.getQualifiedTableName; } });
// Rate Limiting
var redis_rate_limit_adapter_1 = require("./redis-rate-limit.adapter");
Object.defineProperty(exports, "RedisRateLimitAdapter", { enumerable: true, get: function () { return redis_rate_limit_adapter_1.RedisRateLimitAdapter; } });
var rate_limit_factory_1 = require("./rate-limit.factory");
Object.defineProperty(exports, "createRateLimitService", { enumerable: true, get: function () { return rate_limit_factory_1.createRateLimitService; } });
Object.defineProperty(exports, "createRateLimitServiceWithRedis", { enumerable: true, get: function () { return rate_limit_factory_1.createRateLimitServiceWithRedis; } });
