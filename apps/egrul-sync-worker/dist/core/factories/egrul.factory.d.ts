/**
 * Factory для создания сервисов EGRUL Worker
 *
 * @remarks
 * Реализует Dependency Inversion Principle.
 * Централизует создание всех сервисов и их зависимостей.
 *
 * Следует SRP: ответственность только за создание объектов.
 *
 * v2.1: Added ILogger, WorkerConfig, updated TransformPollingWorker (Iteration 4).
 */
import type { IMigrationRunner } from '../ports';
import { MigrationService } from '../domain';
import { TransformPollingWorker } from '../workers/transform-polling.worker';
import { StagingSyncService } from '../services/staging-sync.service';
import { StagingConfig } from '../domain/value-objects/staging-config.vo';
import { WorkerConfig } from '../domain/value-objects/worker-config.vo';
import type { ILogger } from '../domain/ports/i-logger.port';
import type { IStagingStoragePort } from '../domain/ports/i-staging-storage.port';
import type { IProductionStorage } from '../domain/ports/i-production-storage.port';
import type { IMemoryMonitor } from '../domain/ports/i-memory-monitor.port';
import type { ITransformService } from '../domain/ports/i-transform-service.port';
/**
 * Factory для создания сервисов EGRUL Worker
 *
 * @remarks
 * Создаёт все сервисы с правильными зависимостями.
 * Обеспечивает единое место конфигурации инфраструктуры.
 */
export declare class EgrulWorkerFactory {
    private migrationRunner;
    private migrationService;
    private stagingStorage;
    private productionStorage;
    private memoryMonitor;
    private transformService;
    private logger;
    private stagingConfig;
    private workerConfig;
    private readonly migrationsDir;
    constructor(config?: Partial<{
        stagingConfig: StagingConfig;
        workerConfig: WorkerConfig;
    }>);
    /**
     * Создаёт или возвращает Migration runner
     */
    createMigrationRunner(): IMigrationRunner;
    /**
     * Создаёт или возвращает Migration service
     */
    createMigrationService(): MigrationService;
    /**
     * Создаёт или возвращает staging storage adapter
     */
    createStagingStorage(): IStagingStoragePort;
    /**
     * Создаёт или возвращает production storage adapter
     */
    createProductionStorage(): IProductionStorage;
    /**
     * Создаёт или возвращает memory monitor adapter
     *
     * @remarks
     * Added for Transform Service memory checking.
     */
    createMemoryMonitor(): IMemoryMonitor;
    /**
     * Создаёт или возвращает Logger
     *
     * @remarks
     * Singleton logger instance for all components.
     */
    createLogger(): ILogger;
    /**
     * Создаёт или возвращает Worker Config
     *
     * @remarks
     * Returns the worker configuration instance.
     */
    createWorkerConfig(): WorkerConfig;
    /**
     * Создаёт или возвращает Transform Service
     *
     * @remarks
     * Core service for staging → production transformation.
     */
    createTransformService(): ITransformService;
    /**
     * Создаёт Transform Polling Worker
     *
     * @remarks
     * Background worker for automatic transform triggering.
     */
    createTransformPollingWorker(): TransformPollingWorker;
    /**
     * Создаёт Staging Sync Service
     *
     * @remarks
     * Orchestrates sync flow through staging.
     */
    createStagingSyncService(): StagingSyncService;
    /**
     * Закрывает все ресурсы
     */
    shutdown(): Promise<void>;
}
