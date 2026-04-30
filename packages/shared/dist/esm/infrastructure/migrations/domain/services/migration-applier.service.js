"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationApplierService = void 0;
const migration_stats_vo_1 = require("../value-objects/migration-stats.vo");
const migration_applier_metrics_vo_1 = require("./migration-applier-metrics.vo");
const migration_sql_reader_vo_1 = require("./migration-sql-reader.vo");
/**
 * Сервис применения миграций
 *
 * @remarks
 * Отвечает только за применение миграций к базе данных.
 */
class MigrationApplierService {
    migrationRunner;
    migrationsBaseDir;
    constructor(migrationRunner, migrationsBaseDir) {
        this.migrationRunner = migrationRunner;
        this.migrationsBaseDir = migrationsBaseDir;
    }
    /**
     * Применяет все миграции
     *
     * @param descriptors - Дескрипторы миграций
     * @returns Статистика выполнения
     */
    async applyAll(descriptors) {
        const metrics = (0, migration_applier_metrics_vo_1.createMigrationApplierMetrics)();
        metrics.logStart();
        let stats = (0, migration_stats_vo_1.createInitialStats)();
        for (const descriptor of descriptors) {
            const result = await this.applyOne(descriptor);
            stats = (0, migration_stats_vo_1.updateStats)(stats, result);
            if (result.success && !result.skipped) {
                metrics.logSuccess(descriptor, result);
            }
            if (!result.success && !result.skipped) {
                metrics.logFailure(descriptor, result);
                throw new Error(`Migration ${descriptor.version} failed: ${result.error}`);
            }
        }
        metrics.logCompletion(stats);
        return stats;
    }
    /**
     * Применяет одну миграцию
     *
     * @param descriptor - Дескриптор миграции
     * @returns Результат применения
     */
    async applyOne(descriptor) {
        const startTime = Date.now();
        try {
            const isApplied = await this.migrationRunner.isApplied(descriptor.category, descriptor.version);
            if (isApplied) {
                return migration_applier_metrics_vo_1.MigrationApplierMetrics.createSkipResult(startTime);
            }
            const sql = this.readSql(descriptor);
            const result = await this.migrationRunner.apply(sql, {
                category: descriptor.category,
                version: descriptor.version,
                description: descriptor.description
            });
            if (!result.success) {
                return migration_applier_metrics_vo_1.MigrationApplierMetrics.createFailureResult(result, startTime);
            }
            return migration_applier_metrics_vo_1.MigrationApplierMetrics.createSuccessResult(result, startTime);
        }
        catch (error) {
            return migration_applier_metrics_vo_1.MigrationApplierMetrics.createErrorResult(error, startTime);
        }
    }
    /**
     * Читает SQL файл
     *
     * @param descriptor - Дескриптор миграции
     * @returns Содержимое SQL файла
     */
    readSql(descriptor) {
        const reader = new migration_sql_reader_vo_1.MigrationSqlReader(this.migrationsBaseDir);
        return reader.read(descriptor);
    }
}
exports.MigrationApplierService = MigrationApplierService;
