"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnifiedMigrationAdapter = void 0;
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
class UnifiedMigrationAdapter {
    migrationService;
    lock;
    breaker;
    runner;
    constructor(migrationService, lock, breaker, runner) {
        this.migrationService = migrationService;
        this.lock = lock;
        this.breaker = breaker;
        this.runner = runner;
    }
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
    async orchestrate() {
        return this.lock.execute({
            lockKey: 'migration:unified:orchestrate',
            timeoutMs: 300000, // 5 минут
            owner: 'migration-worker'
        }, () => this.applyWithBreaker());
    }
    /**
     * Получает текущий статус миграций
     *
     * @returns Статистика текущего состояния
     *
     * @remarks
     * Не применяет миграции, только возвращает статус.
     * Запрашивает какие миграции уже применены.
     */
    async getStatus() {
        const descriptors = this.migrationService.getDescriptors();
        let applied = 0;
        let skipped = 0;
        for (const descriptor of descriptors) {
            const isApplied = await this.runner.isApplied(descriptor.category, descriptor.version);
            if (isApplied) {
                applied++;
            }
            else {
                skipped++;
            }
        }
        return {
            totalMigrations: descriptors.length,
            appliedMigrations: applied,
            skippedMigrations: skipped,
            failedMigrations: 0,
            durationMs: 0
        };
    }
    /**
     * Применяет миграции через Circuit Breaker
     *
     * @returns Статистика выполнения
     *
     * @remarks
     * Делегирует применение UnifiedMigrationService через Circuit Breaker.
     */
    async applyWithBreaker() {
        const result = await this.breaker.execute(async () => {
            return this.migrationService.applyAll();
        });
        if (!result.success) {
            throw new Error(`Circuit breaker blocked: ${result.error}`);
        }
        return this.convertStats(result.value);
    }
    /**
     * Преобразует внутреннюю статистику во внешнюю
     *
     * @param stats - Внутренняя статистика
     * @returns Статистика для порта
     */
    convertStats(stats) {
        return {
            totalMigrations: stats.total,
            appliedMigrations: stats.applied,
            skippedMigrations: stats.skipped,
            failedMigrations: stats.failed,
            durationMs: stats.durationMs
        };
    }
}
exports.UnifiedMigrationAdapter = UnifiedMigrationAdapter;
