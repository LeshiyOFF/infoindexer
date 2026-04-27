/**
 * Сервис для применения миграций
 *
 * @remarks
 * Domain сервис для управления миграциями базы данных.
 * Следует SRP: отвечает за применение миграций при старте.
 */
import type { IMigrationRunner } from '../ports';
/**
 * Сервис для применения миграций
 */
export declare class MigrationService {
    private readonly migrationRunner;
    private readonly migrationsDir;
    constructor(migrationRunner: IMigrationRunner, migrationsDir: string);
    /**
     * Применяет все миграции
     *
     * @remarks
     * Читает SQL файлы из директории миграций и применяет их по порядку.
     */
    applyAll(): Promise<void>;
    /**
     * Применяет миграцию sync_checkpoints
     */
    private applyCheckpointsMigration;
    /**
     * Убеждается что таблица миграций существует
     */
    private ensureTable;
    /**
     * Применяет миграцию financial_reports ReplacingMergeTree
     */
    private applyFinancialReportsMigration;
    /**
     * Применяет миграцию TTL для автоудаления
     */
    private applyTtlMigration;
    /**
     * Применяет миграцию exemption_criteria Enum8
     */
    private applyExemptionCriteriaEnumMigration;
    /**
     * Применяет миграцию geocoding_quality LowCardinality(String)
     */
    private applyGeocodingQualityStringMigration;
}
