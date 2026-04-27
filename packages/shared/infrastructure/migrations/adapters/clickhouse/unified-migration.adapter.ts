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
import type { MigrationStats } from '../../domain/value-objects';

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
export class UnifiedMigrationAdapter implements IMigrationOrchestrator {
  private readonly runner: IMigrationRunner;

  constructor(
    private readonly migrationService: UnifiedMigrationService,
    private readonly lock: IMigrationLock,
    private readonly breaker: ICircuitBreakerPort,
    runner: IMigrationRunner
  ) {
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
  async orchestrate(): Promise<MigrationOrchestrationStats> {
    return this.lock.execute(
      {
        lockKey: 'migration:unified:orchestrate',
        timeoutMs: 300000, // 5 минут
        owner: 'migration-worker'
      },
      () => this.applyWithBreaker()
    );
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
  async getStatus(): Promise<MigrationOrchestrationStats> {
    const descriptors = this.migrationService.getDescriptors();

    let applied = 0;
    let skipped = 0;

    for (const descriptor of descriptors) {
      const isApplied = await this.runner.isApplied(descriptor.category, descriptor.version);
      if (isApplied) {
        applied++;
      } else {
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
  private async applyWithBreaker(): Promise<MigrationOrchestrationStats> {
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
  private convertStats(stats: MigrationStats): MigrationOrchestrationStats {
    return {
      totalMigrations: stats.total,
      appliedMigrations: stats.applied,
      skippedMigrations: stats.skipped,
      failedMigrations: stats.failed,
      durationMs: stats.durationMs
    };
  }
}
