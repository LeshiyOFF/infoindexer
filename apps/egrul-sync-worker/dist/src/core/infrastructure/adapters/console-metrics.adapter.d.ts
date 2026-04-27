/**
 * Console Adapter для сбора метрик
 *
 * @remarks
 * Реализует IMetricsCollectorPort для вывода в консоль.
 * Формат логов: [METRIC] TYPE name=value {tags} (parsable)
 * Использует ANSI цвета для визуального различия типов.
 *
 * Следует SRP: отвечает только за консольный вывод.
 * Следует DIP: зависит от абстракции IMetricsCollectorPort.
 *
 * @example
 * ```ts
 * const metrics = new ConsoleMetricsAdapter();
 * metrics.recordGauge('memory.heap_used_mb', 123.45, { service: 'worker' });
 * // Вывод: [METRIC] 📊 GAUGE memory.heap_used_mb=123.45 {service:worker}
 * ```
 */
import type { IMetricsCollectorPort, MetricTags, MetricValue } from '../../ports/i-metrics-collector.port';
/**
 * Console Adapter для сбора метрик
 *
 * @remarks
 * Выводит метрики в структурированном формате в консоль.
 * Применяет цвета для улучшения читаемости.
 */
export declare class ConsoleMetricsAdapter implements IMetricsCollectorPort {
    private readonly prefix;
    /**
     * Записывает gauge метрику в консоль
     *
     * @param name - Имя метрики
     * @param value - Числовое значение
     * @param tags - Опциональные теги
     */
    recordGauge(name: string, value: MetricValue, tags?: MetricTags): void;
    /**
     * Записывает counter метрику в консоль
     *
     * @param name - Имя метрики
     * @param value - Значение для добавления
     * @param tags - Опциональные теги
     */
    recordCounter(name: string, value: MetricValue, tags?: MetricTags): void;
    /**
     * Записывает histogram метрику в консоль
     *
     * @param name - Имя метрики
     * @param value - Значение для распределения
     * @param tags - Опциональные теги
     */
    recordHistogram(name: string, value: MetricValue, tags?: MetricTags): void;
    /**
     * Записывает тайминг операции в консоль
     *
     * @param operation - Имя операции
     * @param durationMs - Длительность в миллисекундах
     * @param tags - Опциональные теги
     */
    recordTiming(operation: string, durationMs: MetricValue, tags?: MetricTags): void;
    /**
     * Записывает прогресс операции в консоль
     *
     * @param operation - Имя операции
     * @param percentage - Процент от 0 до 100
     * @param tags - Опциональные теги
     */
    recordProgress(operation: string, percentage: MetricValue, tags?: MetricTags): void;
    /**
     * Записывает метрики использования памяти
     *
     * @param labels - Дополнительные лейблы
     */
    recordMemoryMetrics(labels: Record<string, string>): void;
    /**
     * Унифицированный метод логирования метрик
     *
     * @param type - Тип метрики
     * @param name - Имя метрики
     * @param value - Значение
     * @param tags - Теги
     * @param icon - Иконка
     * @param color - ANSI цвет
     *
     * @remarks
     * DRY: единый метод для всех типов метрик.
     * Формат: [METRIC] 🎭 TYPE name=value {key:value,key:value}
     * Применяет цвета для типа метрики.
     */
    private logMetric;
    /**
     * Форматирует теги в строку
     *
     * @param tags - Объект с тегами
     * @returns Строка формата {key:value,key:value} или пустая строка
     *
     * @remarks
     * DRY: единое место для форматирования тегов.
     */
    private formatTags;
}
