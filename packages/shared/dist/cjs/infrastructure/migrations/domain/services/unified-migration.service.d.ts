/**
 * Unified Migration Service
 *
 * @remarks
 * Domain Service: координирует применение ВСЕХ миграций.
 * Следует SRP: ответственен только за координацию.
 * Следует DIP: зависит от IMigrationRunner port.
 * Следует DRY: использует единый метод applyMigration.
 */
import type { IMigrationRunner } from '../../ports';
import type { MigrationDescriptor, MigrationStats } from '../value-objects';
/**
 * Параметры для создания UnifiedMigrationService
 */
export interface UnifiedMigrationServiceParams {
    /** Migration Runner для применения миграций */
    readonly migrationRunner: IMigrationRunner;
    /** Базовая директория с миграциями */
    readonly migrationsBaseDir: string;
}
/**
 * Unified Migration Service
 *
 * @remarks
 * Domain Service для координации применения всех миграций.
 * Читает SQL файлы и применяет их через IMigrationRunner.
 */
export declare class UnifiedMigrationService {
    private readonly descriptors;
    private readonly params;
    constructor(params: UnifiedMigrationServiceParams);
    /**
     * Применяет все миграции
     *
     * @returns Статистика выполнения
     * @throws {Error} если какая-либо миграция не применяется
     *
     * @remarks
     * - Применяет миграции по порядку версий
     * - Пропускает уже применённые миграции
     * - Собирает статистику
     */
    applyAll(): Promise<MigrationStats>;
    /**
     * Получает список всех дескрипторов миграций
     *
     * @returns Readonly массив дескрипторов
     */
    getDescriptors(): ReadonlyArray<MigrationDescriptor>;
    /**
     * Применяет одну миграцию
     *
     * @param descriptor - Дескриптор миграции
     * @returns Результат применения
     *
     * @remarks
     * DRY compliance: единый метод для применения всех миграций.
     */
    private applyMigration;
    /**
     * Читает SQL файл миграции
     *
     * @param descriptor - Дескриптор миграции
     * @returns Содержимое SQL файла
     */
    private readMigrationFile;
    /**
     * Получает директорию для категории миграции
     *
     * @param category - Категория миграции
     * @returns Имя директории
     */
    private getCategoryDir;
    /**
     * Сортирует дескрипторы по версии
     *
     * @param descriptors - Дескрипторы для сортировки
     * @returns Отсортированные дескрипторы
     */
    private sortByVersion;
}
