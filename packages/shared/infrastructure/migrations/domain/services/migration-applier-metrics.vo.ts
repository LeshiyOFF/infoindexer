/**
 * Migration Applier Metrics
 *
 * @remarks
 * Value Object для логирования и создания результатов применения миграций.
 * Вынесен из MigrationApplierService для соблюдения лимита строк.
 *
 * @pattern Value Object
 * @pattern Single Responsibility Principle
 */
import type { MigrationDescriptor, MigrationStats } from '../value-objects';

/**
 * Результат применения одной миграции
 */
export interface MigrationResult {
  readonly success: boolean;
  readonly skipped: boolean;
  readonly durationMs: number;
  readonly error?: string;
}

/**
 * Метрики применения миграций
 *
 * @remarks
 * VO для логирования и создания результатов.
 */
export class MigrationApplierMetrics {
  /**
   * Логирует начало применения
   */
  logStart(): void {
    console.log('--- CHECKING MIGRATIONS ---');
  }

  /**
   * Логирует пропуск миграции
   *
   * @param descriptor - Дескриптор миграции
   */
  logSkip(descriptor: MigrationDescriptor): void {
    console.log(
      `Migration ${descriptor.category}/${descriptor.version} already applied, skipping`
    );
  }

  /**
   * Логирует успех
   *
   * @param descriptor - Дескриптор миграции
   * @param result - Результат применения
   */
  logSuccess(
    descriptor: MigrationDescriptor,
    result: { durationMs: number }
  ): void {
    console.log(
      `Migration ${descriptor.category}/${descriptor.version} applied successfully in ${result.durationMs}ms`
    );
  }

  /**
   * Логирует ошибку
   *
   * @param descriptor - Дескриптор миграции
   * @param result - Результат с ошибкой
   */
  logFailure(descriptor: MigrationDescriptor, result: MigrationResult): void {
    console.error('Migration failed:', descriptor.version, result.error);
  }

  /**
   * Логирует завершение
   *
   * @param stats - Статистика
   */
  logCompletion(stats: MigrationStats): void {
    console.log('--- MIGRATIONS COMPLETED ---');
    console.log(
      `Total: ${stats.total}, Applied: ${stats.applied}, ` +
      `Skipped: ${stats.skipped}, Failed: ${stats.failed}, Duration: ${stats.durationMs}ms`
    );
  }

  /**
   * Создаёт результат пропуска
   *
   * @param startTime - Время начала
   * @returns Результат
   */
  static createSkipResult(startTime: number): MigrationResult {
    return {
      success: true,
      skipped: true,
      durationMs: Date.now() - startTime
    };
  }

  /**
   * Создаёт результат успеха
   *
   * @param result - Результат из runner
   * @param startTime - Время начала
   * @returns Результат
   */
  static createSuccessResult(
    result: { durationMs: number },
    startTime: number
  ): MigrationResult {
    return {
      success: true,
      skipped: false,
      durationMs: result.durationMs
    };
  }

  /**
   * Создаёт результат ошибки
   *
   * @param result - Результат из runner
   * @param startTime - Время начала
   * @returns Результат
   */
  static createFailureResult(
    result: { durationMs: number; error?: string },
    startTime: number
  ): MigrationResult {
    return {
      success: false,
      skipped: false,
      durationMs: result.durationMs,
      error: result.error
    };
  }

  /**
   * Создаёт результат ошибки из exception
   *
   * @param error - Ошибка
   * @param startTime - Время начала
   * @returns Результат
   */
  static createErrorResult(error: unknown, startTime: number): MigrationResult {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      skipped: false,
      durationMs: Date.now() - startTime,
      error: errorMessage
    };
  }
}

/**
 * Создаёт метрики применения
 *
 * @returns Метрики
 */
export function createMigrationApplierMetrics(): MigrationApplierMetrics {
  return new MigrationApplierMetrics();
}
