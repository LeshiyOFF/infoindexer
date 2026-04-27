/**
 * Factory для создания сервисов EGRUL Worker
 *
 * @remarks
 * Реализует Dependency Inversion Principle.
 * Централизует создание всех сервисов и их зависимостей.
 *
 * Следует SRP: ответственность только за создание объектов.
 */
import type { IMigrationRunner } from '../ports';
import { MigrationService } from '../domain';
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
     * Закрывает все ресурсы
     *
     * @remarks
     * В текущей реализации миграционные сервисы не требуют закрытия.
     * Метод добавлен для совместимости с паттерном Factory.
     */
    shutdown(): Promise<void>;
}
