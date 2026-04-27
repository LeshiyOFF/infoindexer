/**
 * Типы для Health Check системы
 *
 * @remarks
 * Domain Layer — Types в Hexagonal Architecture.
 * Определяет контракты для health check компонентов.
 *
 * Следует SRP: ответственен только за типы данных.
 */

/**
 * Статус здоровья компонента
 */
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

/**
 * Базовый интерфейс статуса компонента
 */
export interface ComponentHealth {
  /** Название компонента */
  readonly name: string;

  /** Текущий статус */
  readonly status: HealthStatus;

  /** Время проверки */
  readonly checkedAt: number;

  /** Детальное сообщение (опционально) */
  readonly message?: string;

  /** Дополнительные данные (опционально) */
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Составные части общего health статуса
 */
export interface HealthComponents {
  /** Статус ClickHouse */
  readonly clickhouse?: ComponentHealth;

  /** Статус Circuit Breaker */
  readonly circuitBreaker?: ComponentHealth;

  /** Статус Redis */
  readonly redis?: ComponentHealth;

  /** Статус памяти */
  readonly memory?: ComponentHealth;
}

/**
 * Полный отчёт о здоровье системы
 *
 * @remarks
 * Агрегирует статус всех компонентов.
 * Общий статус определяется худшим из компонентов.
 */
export interface HealthReport {
  /** Общий статус системы */
  readonly status: HealthStatus;

  /** Время генерации отчёта */
  readonly timestamp: number;

  /** Время работы процесса (мс) */
  readonly uptime: number;

  /** Статус компонентов */
  readonly components: HealthComponents;

  /** Количество активных операций */
  readonly activeOperations: number;

  /** Версия приложения */
  readonly version: string;
}

/**
 * Результат проверки ClickHouse
 */
export interface ClickHouseHealthResult {
  /** Доступность */
  readonly available: boolean;

  /** Время ответа (мс) */
  readonly latency: number;

  /** Размер таблиц (опционально) */
  readonly tables?: Readonly<Record<string, number>>;

  /** Ошибка если недоступен */
  readonly error?: string;
}

/**
 * Результат проверки Redis
 */
export interface RedisHealthResult {
  /** Доступность */
  readonly available: boolean;

  /** Время ответа (мс) */
  readonly latency: number;

  /** Количество активных подключений */
  readonly connections?: number;

  /** Ошибка если недоступен */
  readonly error?: string;
}

/**
 * Результат проверки памяти
 */
export interface MemoryHealthResult {
  /** Использовано памяти (байт) */
  readonly used: number;

  /** Доступно памяти (байт) */
  readonly available: number;

  /** Процент использования */
  readonly percent: number;

  /** Лимит (байт) */
  readonly limit: number;
}
