/**
 * Null Adapter для сбора метрик (no-op)
 *
 * @remarks
 * Реализует IMetricsCollectorPort с пустыми методами.
 * Следует Null Object pattern: не бросает, не логирует, ничего не делает.
 * Используется в production когда метрики отключены.
 *
 * Преимущества:
 * - Нет накладных расходов на выполнение
 * - Не требует conditional logic в коде использования
 * - Можно заменить на реальный adapter без изменения кода
 *
 * @example
 * ```ts
 * const metrics = process.env.ENABLE_METRICS === 'true'
 *   ? new ConsoleMetricsAdapter()
 *   : new NullMetricsAdapter();
 * ```
 */
import type { IMetricsCollectorPort, MetricTags, MetricValue } from '../../ports/i-metrics-collector.port';
/**
 * Null Adapter для сбора метрик
 *
 * @remarks
 * Все методы пустые (no-op).
 * Следует Null Object pattern.
 */
export declare class NullMetricsAdapter implements IMetricsCollectorPort {
    /**
     * No-op для gauge метрики
     */
    recordGauge(_name: string, _value: MetricValue, _tags?: MetricTags): void;
    /**
     * No-op для counter метрики
     */
    recordCounter(_name: string, _value: MetricValue, _tags?: MetricTags): void;
    /**
     * No-op для histogram метрики
     */
    recordHistogram(_name: string, _value: MetricValue, _tags?: MetricTags): void;
    /**
     * No-op для timing метрики
     */
    recordTiming(_operation: string, _durationMs: MetricValue, _tags?: MetricTags): void;
    /**
     * No-op для progress метрики
     */
    recordProgress(_operation: string, _percentage: MetricValue, _tags?: MetricTags): void;
    /**
     * No-op для memory метрик
     */
    recordMemoryMetrics(_labels: Record<string, string>): void;
}
