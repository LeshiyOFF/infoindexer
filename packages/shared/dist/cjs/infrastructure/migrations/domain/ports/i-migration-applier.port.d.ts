/**
 * Port: IMigrationApplier
 *
 * @remarks
 * Абстракция для применения миграций к базе данных.
 * Следует Hexagonal/Ports & Adapters pattern.
 *
 * @pattern Hexagonal/Ports & Adapters
 * @pattern Interface Segregation Principle
 * @pattern Dependency Inversion Principle
 */
import type { MigrationDescriptor, MigrationStats } from '../value-objects';
/**
 * Port для применения миграций
 *
 * @remarks
 * Определяет контракт для применения миграций к базе данных.
 *
 * Domain layer зависит от этой абстракции, не от конкретной реализации.
 */
export interface IMigrationApplier {
    /**
     * Применяет все миграции
     *
     * @param descriptors - Дескрипторы миграций для применения
     * @returns Статистика выполнения
     * @throws {Error} если какая-либо миграция не применяется
     *
     * @remarks
     * - Применяет миграции по порядку версий
     * - Пропускает уже применённые миграции
     * - Собирает статистику
     */
    applyAll(descriptors: ReadonlyArray<MigrationDescriptor>): Promise<MigrationStats>;
}
