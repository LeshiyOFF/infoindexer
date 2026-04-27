/**
 * Сервис для применения миграций
 *
 * @remarks
 * Domain сервис для управления миграциями базы данных.
 * Следует SRP: отвечает за применение миграций при старте.
 *
 * Координирует применение миграций через IMigrationRunner порт.
 * Следует DRY: использует дескрипторы миграций вместо дублирования кода.
 */
import type { IMigrationRunner } from '../ports';
/**
 * Сервис для применения миграций
 *
 * @remarks
 * Читает SQL файлы из директории миграций и применяет их по порядку.
 * Обеспечивает идемпотентность через проверку версий.
 *
 * DRY compliance: использует единый метод applyMigration вместо дублирования.
 */
export declare class MigrationService {
    private readonly migrationRunner;
    private readonly migrationsDir;
    private readonly migrations;
    constructor(migrationRunner: IMigrationRunner, migrationsDir: string);
    /**
     * Применяет все миграции
     *
     * @remarks
     * Применяет миграции по порядку из массива дескрипторов.
     * Пропускает уже применённые миграции.
     *
     * @throws Error если какая-либо миграция не применяется
     */
    applyAll(): Promise<void>;
    /**
     * Применяет одну миграцию
     *
     * @remarks
     * DRY compliance: единый метод для применения всех миграций.
     * Вынесен из отдельных методов для устранения дублирования.
     *
     * @param descriptor - Дескриптор миграции
     * @throws Error если миграция не применяется
     */
    private applyMigration;
}
