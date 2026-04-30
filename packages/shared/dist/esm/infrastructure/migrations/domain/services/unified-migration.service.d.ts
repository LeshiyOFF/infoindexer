/**
 * Unified Migration Service
 *
 * @remarks
 * v2.1: Refactored to Orchestrator pattern
 * Domain Service: координирует применение ВСЕХ миграций.
 *
 * Следует SRP: ответственен только за координацию.
 * Следует DIP: зависит от Ports (IMigrationDiscoverer, IMigrationApplier).
 * Следует DRY: делегирует работу специализированным сервисам.
 *
 * @pattern Single Responsibility Principle (только координация)
 * @pattern Dependency Inversion Principle (зависит от Ports)
 * @pattern Orchestrator Pattern
 */
import type { MigrationDescriptor, MigrationStats } from '../value-objects';
import type { IMigrationDiscoverer } from '../ports';
import type { IMigrationApplier } from '../ports';
/**
 * Параметры для создания UnifiedMigrationService
 *
 * @remarks
 * v2.1: Зависимости через Ports для соблюдения DIP.
 */
export interface UnifiedMigrationServiceParams {
    /** Discoverer для обнаружения миграций */
    readonly discoverer: IMigrationDiscoverer;
    /** Applier для применения миграций */
    readonly applier: IMigrationApplier;
}
/**
 * Unified Migration Service (Orchestrator)
 *
 * @remarks
 * v2.1: Переписан как координатор.
 * Делегирует обнаружение и применение специализированным сервисам.
 *
 * Изменения:
 * - Убрана прямая зависимость от IMigrationRunner
 * - Убрана логика обнаружения (делегирует Discoverer)
 * - Убрана логика применения (делегирует Applier)
 * - Зависимости через Ports (DIP compliance)
 */
export declare class UnifiedMigrationService {
    private readonly discoverer;
    private readonly applier;
    constructor(params: UnifiedMigrationServiceParams);
    /**
     * Применяет все миграции
     *
     * @returns Статистика выполнения
     * @throws {Error} если какая-либо миграция не применяется
     *
     * @remarks
     * Делегирует работу:
     * 1. Discoverer → обнаруживает миграции
     * 2. Applier → применяет миграции
     */
    applyAll(): Promise<MigrationStats>;
    /**
     * Получает список всех дескрипторов миграций
     *
     * @returns Readonly массив дескрипторов
     *
     * @remarks
     * Делегирует работу Discoverer.
     */
    getDescriptors(): ReadonlyArray<MigrationDescriptor>;
}
