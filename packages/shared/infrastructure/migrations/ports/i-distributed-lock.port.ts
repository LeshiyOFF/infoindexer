/**
 * Distributed Lock Port
 *
 * @remarks
 * Предотвращает параллельное выполнение миграций
 * в multi-instance окружении.
 */

/**
 * Результат захвата lock
 */
export interface Lock {
  /** Уникальный идентификатор lock */
  readonly id: string;

  /** Ресурс который заблокирован */
  readonly resource: string;

  /** Время истечения lock (Unix timestamp) */
  readonly expiresAt: number;
}

/**
 * Опции для захвата lock
 */
export interface LockOptions {
  /** Время жизни lock в мс (default: 60000 = 1 минута) */
  readonly ttl?: number;

  /** Время ожидания захвата в мс (default: 5000) */
  readonly waitTimeout?: number;

  /** Идентификатор экземпляра (для логирования) */
  readonly instanceId?: string;
}

/**
 * Port для распределённой блокировки
 *
 * @remarks
 * Используется для предотвращения параллельного выполнения миграций
 * в multi-instance окружении.
 */
export interface IDistributedLock {
  /**
   * Пытается захватить lock
   *
   * @param resource - Имя ресурса (например: 'migrations')
   * @param options - Опции захвата
   * @returns Lock если захвачен, null если timeout
   *
   * @remarks
   * - Если lock уже захвачен другим экземпляром, ждёт освобождения
   * - По истечении waitTimeout возвращает null
   * - Lock автоматически освобождается по TTL
   */
  acquireLock(resource: string, options?: LockOptions): Promise<Lock | null>;

  /**
   * Освобождает lock
   *
   * @param lock - Lock для освобождения
   * @returns Promise<void>
   *
   * @remarks
   * - Безопасно вызывать несколько раз (idempotent)
   * - Можно не вызывать — lock истечёт по TTL
   */
  releaseLock(lock: Lock): Promise<void>;

  /**
   * Проверяет захвачен ли lock
   *
   * @param resource - Имя ресурса
   * @returns true если захвачен
   */
  isLocked(resource: string): Promise<boolean>;
}
