/**
 * Migration Lock Port — интерфейс для distributed lock
 *
 * @remarks
 * Domain Layer: определяет контракт для distributed locking.
 * Infrastructure Layer реализует через Redis.
 */

/**
 * Опции для получения lock
 */
export interface MigrationLockOptions {
  /** Уникальный ключ lock (например, 'migration:financial_reports_summary') */
  lockKey: string;

  /** TTL в миллисекундах (auto-release при сбое) */
  timeoutMs: number;

  /** Идентификатор владельца (для логирования) */
  owner: string;

  /** Количество retry при неудаче (default: 3) */
  retryCount?: number;

  /** Задержка между retry в мс (default: random 100-500) */
  retryDelayMs?: number;
}

/**
 * Порт для distributed lock (Domain Layer)
 */
export interface IMigrationLock {
  /**
   * Выполняет action под distributed lock
   *
   * @throws {Error} если lock уже занят другим процессом
   */
  execute<T>(options: MigrationLockOptions, action: () => Promise<T>): Promise<T>;

  /**
   * Проверяет что lock свободен
   */
  isAvailable(lockKey: string): Promise<boolean>;

  /**
   * Принудительно освобождает lock (для recovery)
   */
  forceRelease(lockKey: string): Promise<void>;
}
