/**
 * Port для сбора и экспорта метрик
 *
 * @remarks
 * Порт в Hexagonal Architecture.
 * Абстрагирует способ отправки метрик (console, Prometheus, DataDog).
 * Следует Interface Segregation: только необходимые методы.
 * Следует Dependency Inversion: Domain → Interface ← Infrastructure.
 *
 * @example
 * ```ts
 * class MyService {
 *   constructor(private readonly metrics: IMetricsCollectorPort) {}
 *
 *   async doWork() {
 *     const start = Date.now();
 *     try {
 *       // ... работа ...
 *       this.metrics.recordCounter('work.completed', 1, { type: 'batch' });
 *     } catch (e) {
 *       this.metrics.recordCounter('work.failed', 1, { type: 'batch' });
 *       throw e;
 *     } finally {
 *       this.metrics.recordTiming('work.duration', Date.now() - start);
 *     }
 *   }
 * }
 * ```
 */
/**
 * Теги метрики для группировки и фильтрации
 *
 * @remarks
 * Value Object для тегов метрик.
 * Неизменяемый (readonly).
 */
export type MetricTags = Readonly<Record<string, string>>;
/**
 * Значение метрики (число)
 */
export type MetricValue = number;
/**
 * Port для сбора и экспорта метрик
 *
 * @remarks
 * Определяет контракт для сбора метрик.
 * Поддерживает четыре типа метрик: gauge, counter, histogram, timing.
 */
export interface IMetricsCollectorPort {
    /**
     * Записывает gauge метрику (текущее значение)
     *
     * @param name - Имя метрики (формата namespace.metric_name)
     * @param value - Числовое значение
     * @param tags - Опциональные теги для группировки
     *
     * @remarks
     * Gauge показывает текущее значение в момент времени.
     * Примеры: memory_usage_mb, active_connections, queue_size.
     * Может как увеличиваться, так и уменьшаться.
     */
    recordGauge(name: string, value: MetricValue, tags?: MetricTags): void;
    /**
     * Записывает counter метрику (счётчик)
     *
     * @param name - Имя метрики (формата namespace.metric_name)
     * @param value - Значение для добавления (обычно 1)
     * @param tags - Опциональные теги для группировки
     *
     * @remarks
     * Counter только увеличивается (монотонно растущий).
     * Примеры: requests_total, errors_total, batches_processed.
     * При рестарте значение сбрасывается.
     */
    recordCounter(name: string, value: MetricValue, tags?: MetricTags): void;
    /**
     * Записывает histogram метрику (распределение)
     *
     * @param name - Имя метрики (формата namespace.metric_name)
     * @param value - Значение для добавления в распределение
     * @param tags - Опциональные теги для группировки
     *
     * @remarks
     * Histogram собирает статистику распределения значений.
     * Примеры: request_duration_ms, batch_size_bytes, query_time_ms.
     * Позволяет получить p50, p95, p99, max, avg, count.
     */
    recordHistogram(name: string, value: MetricValue, tags?: MetricTags): void;
    /**
     * Записывает тайминг операции
     *
     * @param operation - Имя операции (формата namespace.operation_name)
     * @param durationMs - Длительность в миллисекундах
     * @param tags - Опциональные теги для группировки
     *
     * @remarks
     * Синтаксический сахар над recordHistogram.
     * Автоматически добавляет суффикс _duration_ms к имени.
     * Примеры: batch_process, query_execute, data_sync.
     */
    recordTiming(operation: string, durationMs: MetricValue, tags?: MetricTags): void;
    /**
     * Записывает процент завершения
     *
     * @param operation - Имя операции
     * @param percentage - Процент от 0 до 100
     * @param tags - Опциональные теги
     *
     * @remarks
     * Синтаксический сахар для recordGauge.
     * Автоматически добавляет суффикс _progress_pct.
     */
    recordProgress(operation: string, percentage: MetricValue, tags?: MetricTags): void;
    /**
     * Записывает метрики использования памяти
     *
     * @param labels - Дополнительные лейблы
     *
     * @remarks
     * Записывает несколько gauge метрик:
     * - heap_used_mb: использованная heap память
     * - heap_total_mb: общая выделенная heap память
     * - rss_mb: Resident Set Size
     * - external_mb: внешняя память (C++ objects)
     */
    recordMemoryMetrics(labels: Record<string, string>): void;
}
