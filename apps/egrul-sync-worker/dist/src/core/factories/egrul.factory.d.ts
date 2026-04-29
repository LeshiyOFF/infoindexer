/**
 * Factory для создания сервисов EGRUL Worker
 *
 * @remarks
 * Реализует Dependency Inversion Principle.
 * Централизует создание всех сервисов и их зависимостей.
 *
 * Следует SRP: ответственность только за создание объектов.
 *
 * v1.5: Added createProductionStorage for Iteration 1.
 */
import type { IMigrationRunner } from '../ports';
import { MigrationService } from '../domain';
import type { IStagingStoragePort } from '../domain/ports/i-staging-storage.port';
import type { IProductionStorage } from '../domain/ports/i-production-storage.port';
/**
 * Factory для создания сервисов EGRUL Worker
 *
 * @remarks
 * Создаёт миграционные сервисы с правильными зависимостями.
 * Обеспечивает единое место конфигурации инфраструктуры.
 */
export declare class EgrulWorkerFactory {
    private migrationRunner;
    private migrationService;
    private stagingStorage;
    private productionStorage;
    private readonly migrationsDir;
    /**
     * Создаёт или возвращает Migration runner
     *
     * @remarks
     * Адаптер для выполнения миграций ClickHouse.
     */
    createMigrationRunner(): IMigrationRunner;
    /**
     * Создаёт или возвращает Migration service
     *
     * @remarks
     * Domain сервис для автоматического применения миграций при старте.
     */
    createMigrationService(): MigrationService;
    /**
     * Создаёт или возвращает staging storage adapter
     *
     * @remarks
     * Adapter for staging table operations.
     */
    createStagingStorage(): IStagingStoragePort;
    /**
     * Создаёт или возвращает production storage adapter
     *
     * @remarks
     * Adapter for production table operations.
     * Added in v1.5 for Iteration 1.
     */
    createProductionStorage(): IProductionStorage;
    /**
     * Закрывает все ресурсы
     *
     * @remarks
     * В текущей реализации миграционные сервисы не требуют закрытия.
     * Метод добавлен для совместимости с паттерном Factory.
     */
    shutdown(): Promise<void>;
}
