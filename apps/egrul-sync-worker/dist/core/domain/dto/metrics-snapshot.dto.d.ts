/**
 * Metrics Snapshot DTO
 *
 * @remarks
 * Data Transfer Objects for metrics snapshot.
 * Contains only interfaces - no factory logic (SRP compliance).
 *
 * @pattern Value Object
 * @pattern Single Responsibility Principle
 */
/**
 * Тип метрики
 *
 * @remarks
 * Определяет тип метрики для правильной агрегации.
 */
export type MetricType = 'gauge' | 'counter' | 'histogram' | 'timing';
/**
 * Отдельная метрика
 *
 * @remarks
 * Представляет одну метрику с её значением и тегами.
 * Immutable (readonly) для предотвращения мутаций.
 */
export interface Metric {
    /** Имя метрики */
    readonly name: string;
    /** Тип метрики */
    readonly type: MetricType;
    /** Значение */
    readonly value: number;
    /** Теги для группировки */
    readonly tags?: Readonly<Record<string, string>>;
    /** Временная метка */
    readonly timestamp: Date;
}
/**
 * Метаданные снапшота
 *
 * @remarks
 * Контекстная информация о снапшоте.
 * Immutable (readonly) для предотвращения мутаций.
 */
export interface MetricsMetadata {
    /** Имя сервиса */
    readonly service: string;
    /** Версия сервиса */
    readonly version?: string;
    /** Имя хоста */
    readonly hostname?: string;
    /** Дополнительные поля */
    readonly extra?: Readonly<Record<string, string | number>>;
}
/**
 * Снапшот всех метрик системы
 *
 * @remarks
 * Содержит все метрики в определённый момент времени.
 * Immutable (readonly) для предотвращения мутаций.
 */
export interface MetricsSnapshot {
    /** Время снапшота */
    readonly timestamp: Date;
    /** Все метрики */
    readonly metrics: readonly Metric[];
    /** Метаданные снапшота */
    readonly metadata: Readonly<MetricsMetadata>;
}
