/**
 * Unified Migration Adapter
 *
 * @remarks
 * Infrastructure Layer: реализует IMigrationOrchestrator порт.
 * Координирует применение всех миграций с distributed lock и fault tolerance.
 *
 * Следует SRP: ответственен только за оркестрацию.
 * Следует DIP: реализует IMigrationOrchestrator port.
 * Следует DRY: делегирует применение миграций UnifiedMigrationService.
 */
import type { IMigrationOrchestrator, MigrationOrchestrationStats } from '../../ports';
import type { IMigrationLock } from '../../../ports/i-migration-lock.port';
import type { ICircuitBreakerPort } from '../../../circuit-breaker/ports/i-circuit-breaker.port';
import type { IMigrationRunner } from '../../ports';
import { UnifiedMigrationService } from '../../domain/services';
/**
 * Unified Migration Adapter
 *
 * @remarks
 * Реализует IMigrationOrchestrator порт.
 * Использует:
 * - UnifiedMigrationService для применения миграций
 * - IMigrationLock для distributed lock
 * - ICircuitBreakerPort для fault tolerance
 */
export declare class UnifiedMigrationAdapter implements IMigrationOrchestrator {
    private readonly migrationService;
    private readonly lock;
    private readonly breaker;
    private readonly runner;
    constructor(migrationService: UnifiedMigrationService, lock: IMigrationLock, breaker: ICircuitBreakerPort, runner: IMigrationRunner);
    /**
     * Применяет все миграции с distributed lock
     *
     * @returns Статистика выполнения
     * @throws {Error} если миграция не удалась
     *
     * @remarks
     * - Приобретает distributed lock
     * - Применяет миграции через Circuit Breaker
     * - Преобразует статистику
     */
    orchestrate(): Promise<MigrationOrchestrationStats>;
    /**
     * Получает текущий статус миграций
     *
     * @returns Статистика текущего состояния
     *
     * @remarks
     * Не применяет миграции, только возвращает статус.
     * Запрашивает какие миграции уже применены.
     */
    getStatus(): Promise<MigrationOrchestrationStats>;
    /**
     * Применяет миграции через Circuit Breaker
     *
     * @returns Статистика выполнения
     *
     * @remarks
     * Делегирует применение UnifiedMigrationService через Circuit Breaker.
     */
    private applyWithBreaker;
    /**
     * Преобразует внутреннюю статистику во внешнюю
     *
     * @param stats - Внутренняя статистика
     * @returns Статистика для порта
     */
    private convertStats;
}
