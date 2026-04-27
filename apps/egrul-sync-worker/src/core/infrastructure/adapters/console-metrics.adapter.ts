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
 * ANSI escape коды для цветов терминала
 *
 * @remarks
 * Используются для визуального различия типов метрик.
 */
const ANSI_COLORS = {
  gauge: '\x1b[36m',      // Cyan
  counter: '\x1b[32m',    // Green
  histogram: '\x1b[35m',  // Magenta
  timing: '\x1b[33m',     // Yellow
  progress: '\x1b[34m',   // Blue
  reset: '\x1b[0m'
} as const;

/**
 * Иконки для типов метрик
 *
 * @remarks
 * Визуальные маркеры для быстрой идентификации.
 */
const METRIC_ICONS = {
  gauge: '📊',
  counter: '🔢',
  histogram: '📈',
  timing: '⏱️',
  progress: '📊'
} as const;

/**
 * Типы метрик для цветового выделения
 */
type MetricType = 'GAUGE' | 'COUNTER' | 'HISTOGRAM' | 'TIMING' | 'PROGRESS';

/**
 * Console Adapter для сбора метрик
 *
 * @remarks
 * Выводит метрики в структурированном формате в консоль.
 * Применяет цвета для улучшения читаемости.
 */
export class ConsoleMetricsAdapter implements IMetricsCollectorPort {
  private readonly prefix = '[METRIC]';

  /**
   * Записывает gauge метрику в консоль
   *
   * @param name - Имя метрики
   * @param value - Числовое значение
   * @param tags - Опциональные теги
   */
  recordGauge(name: string, value: MetricValue, tags?: MetricTags): void {
    this.logMetric('GAUGE', name, value, tags, METRIC_ICONS.gauge, ANSI_COLORS.gauge);
  }

  /**
   * Записывает counter метрику в консоль
   *
   * @param name - Имя метрики
   * @param value - Значение для добавления
   * @param tags - Опциональные теги
   */
  recordCounter(name: string, value: MetricValue, tags?: MetricTags): void {
    this.logMetric('COUNTER', name, value, tags, METRIC_ICONS.counter, ANSI_COLORS.counter);
  }

  /**
   * Записывает histogram метрику в консоль
   *
   * @param name - Имя метрики
   * @param value - Значение для распределения
   * @param tags - Опциональные теги
   */
  recordHistogram(name: string, value: MetricValue, tags?: MetricTags): void {
    this.logMetric('HISTOGRAM', name, value, tags, METRIC_ICONS.histogram, ANSI_COLORS.histogram);
  }

  /**
   * Записывает тайминг операции в консоль
   *
   * @param operation - Имя операции
   * @param durationMs - Длительность в миллисекундах
   * @param tags - Опциональные теги
   */
  recordTiming(operation: string, durationMs: MetricValue, tags?: MetricTags): void {
    const name = `${operation}_duration_ms`;
    this.logMetric('TIMING', name, durationMs, tags, METRIC_ICONS.timing, ANSI_COLORS.timing);
  }

  /**
   * Записывает прогресс операции в консоль
   *
   * @param operation - Имя операции
   * @param percentage - Процент от 0 до 100
   * @param tags - Опциональные теги
   */
  recordProgress(operation: string, percentage: MetricValue, tags?: MetricTags): void {
    const name = `${operation}_progress_pct`;
    const clamped = Math.max(0, Math.min(100, percentage));
    this.logMetric('PROGRESS', name, clamped, tags, METRIC_ICONS.progress, ANSI_COLORS.progress);
  }

  /**
   * Записывает метрики использования памяти
   *
   * @param labels - Дополнительные лейблы
   */
  recordMemoryMetrics(labels: Record<string, string>): void {
    const mem = process.memoryUsage();
    const heapUsedMB = mem.heapUsed / (1024 * 1024);
    const heapTotalMB = mem.heapTotal / (1024 * 1024);
    const rssMB = mem.rss / (1024 * 1024);

    this.logMetric('GAUGE', 'memory.heap_used_mb', heapUsedMB, labels, METRIC_ICONS.gauge, ANSI_COLORS.gauge);
    this.logMetric('GAUGE', 'memory.heap_total_mb', heapTotalMB, labels, METRIC_ICONS.gauge, ANSI_COLORS.gauge);
    this.logMetric('GAUGE', 'memory.rss_mb', rssMB, labels, METRIC_ICONS.gauge, ANSI_COLORS.gauge);

    if (mem.external) {
      const externalMB = mem.external / (1024 * 1024);
      this.logMetric('GAUGE', 'memory.external_mb', externalMB, labels, METRIC_ICONS.gauge, ANSI_COLORS.gauge);
    }
  }

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
  private logMetric(
    type: MetricType,
    name: string,
    value: MetricValue,
    tags: MetricTags | undefined,
    icon: string,
    color: string
  ): void {
    const tagsStr = this.formatTags(tags);
    const coloredType = `${color}${type}${ANSI_COLORS.reset}`;
    console.log(`${this.prefix} ${icon} ${coloredType} ${name}=${value}${tagsStr}`);
  }

  /**
   * Форматирует теги в строку
   *
   * @param tags - Объект с тегами
   * @returns Строка формата {key:value,key:value} или пустая строка
   *
   * @remarks
   * DRY: единое место для форматирования тегов.
   */
  private formatTags(tags: MetricTags | undefined): string {
    if (!tags || Object.keys(tags).length === 0) {
      return '';
    }

    const entries = Object.entries(tags)
      .map(([key, value]) => `${key}:${value}`)
      .join(',');

    return ` {${entries}}`;
  }
}
