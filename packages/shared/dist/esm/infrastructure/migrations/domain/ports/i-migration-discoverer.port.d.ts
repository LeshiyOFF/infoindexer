/**
 * Port: IMigrationDiscoverer
 *
 * @remarks
 * Абстракция для обнаружения миграций из файловой системы.
 * Следует Hexagonal/Ports & Adapters pattern.
 *
 * @pattern Hexagonal/Ports & Adapters
 * @pattern Interface Segregation Principle
 * @pattern Dependency Inversion Principle
 */
import type { MigrationDescriptor } from '../value-objects';
/**
 * Port для обнаружения миграций
 *
 * @remarks
 * Определяет контракт для сканирования файловой системы
 * и построения дескрипторов миграций.
 *
 * Domain layer зависит от этой абстракции, не от конкретной реализации.
 */
export interface IMigrationDiscoverer {
    /**
     * Обнаруживает все миграции
     *
     * @returns Отсортированный список дескрипторов миграций
     *
     * @remarks
     * - Сканирует файловую систему
     * - Парсит метаданные из SQL комментариев
     * - Сортирует по версии
     * - Fallback на legacy если ничего не найдено
     */
    discover(): ReadonlyArray<MigrationDescriptor>;
}
