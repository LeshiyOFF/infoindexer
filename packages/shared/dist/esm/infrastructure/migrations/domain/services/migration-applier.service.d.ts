/**
 * Migration Applier Service
 *
 * @remarks
 * Сервис для применения миграций к базе данных.
 * Реализует IMigrationApplier port.
 *
 * v2.1: Вынесен из UnifiedMigrationService для соблюдения SRP.
 *
 * @pattern Single Responsibility Principle (только применение)
 * @pattern Dependency Inversion Principle (зависит от IMigrationRunner)
 */
import type { IMigrationApplier } from '../ports/i-migration-applier.port';
import type { IMigrationRunner } from '../../ports/i-migration-runner.port';
import type { MigrationDescriptor } from '../value-objects/migration-descriptor.vo';
import type { MigrationStats } from '../value-objects/migration-stats.vo';
/**
 * Сервис применения миграций
 *
 * @remarks
 * Отвечает только за применение миграций к базе данных.
 */
export declare class MigrationApplierService implements IMigrationApplier {
    private readonly migrationRunner;
    private readonly migrationsBaseDir;
    constructor(migrationRunner: IMigrationRunner, migrationsBaseDir: string);
    /**
     * Применяет все миграции
     *
     * @param descriptors - Дескрипторы миграций
     * @returns Статистика выполнения
     */
    applyAll(descriptors: ReadonlyArray<MigrationDescriptor>): Promise<MigrationStats>;
    /**
     * Применяет одну миграцию
     *
     * @param descriptor - Дескриптор миграции
     * @returns Результат применения
     */
    private applyOne;
    /**
     * Читает SQL файл
     *
     * @param descriptor - Дескриптор миграции
     * @returns Содержимое SQL файла
     */
    private readSql;
}
