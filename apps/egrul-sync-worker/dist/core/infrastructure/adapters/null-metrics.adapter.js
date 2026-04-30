"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NullMetricsAdapter = void 0;
/**
 * Null Adapter для сбора метрик
 *
 * @remarks
 * Все методы пустые (no-op).
 * Следует Null Object pattern.
 */
class NullMetricsAdapter {
    /**
     * No-op для gauge метрики
     */
    recordGauge(_name, _value, _tags) {
        // No-op
    }
    /**
     * No-op для counter метрики
     */
    recordCounter(_name, _value, _tags) {
        // No-op
    }
    /**
     * No-op для histogram метрики
     */
    recordHistogram(_name, _value, _tags) {
        // No-op
    }
    /**
     * No-op для timing метрики
     */
    recordTiming(_operation, _durationMs, _tags) {
        // No-op
    }
    /**
     * No-op для progress метрики
     */
    recordProgress(_operation, _percentage, _tags) {
        // No-op
    }
    /**
     * No-op для memory метрик
     */
    recordMemoryMetrics(_labels) {
        // No-op
    }
}
exports.NullMetricsAdapter = NullMetricsAdapter;
