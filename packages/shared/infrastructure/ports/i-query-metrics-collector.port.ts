/**
 * Query Metrics Collector Port
 *
 * @remarks
 * Port interface для сбора метрик запросов.
 * Следует Dependency Inversion: domain зависит от этого port.
 * Следует Interface Segregation: минимальный интерфейс только для метрик.
 * Следует SRP: только определение контракта сбора метрик.
 *
 * Используется CompaniesMetaSyncWorker для записи метрик синхронизации.
 */
export interface IQueryMetricsCollector {
  /**
   * Записать метрики выполнения запроса
   *
   * @param queryName - Название запроса
   * @param durationMs - Время выполнения в миллисекундах
   * @param rowsAffected - Количество затронутых строк
   */
  recordQuery(
    queryName: string,
    durationMs: number,
    rowsAffected: number
  ): void;

  /**
   * Записать ошибку запроса
   *
   * @param queryName - Название запроса
   * @param error - Сообщение об ошибке
   */
  recordError(queryName: string, error: string): void;

  /**
   * Получить собранные метрики
   *
   * @returns Объект с метриками или null если метрик нет
   */
  getMetrics(): QueryMetrics | null;
}

/**
 * Метрики запросов
 */
export interface QueryMetrics {
  /** Общее количество запросов */
  totalQueries: number;
  /** Общее количество ошибок */
  totalErrors: number;
  /** Общее время выполнения (мс) */
  totalDurationMs: number;
  /** Общее количество строк */
  totalRows: number;
}
