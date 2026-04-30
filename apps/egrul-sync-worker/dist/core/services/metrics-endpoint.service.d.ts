/**
 * Metrics Endpoint Service
 *
 * @remarks
 * Сервис для сбора метрик в JSON формат.
 * Следует SRP: только сбор метрик, не хранение и не экспорт.
 *
 * @pattern Single Responsibility Principle
 * @pattern Dependency Inversion Principle
 */
import type { IMetricsCollectorPort } from '../ports/i-metrics-collector.port';
import type { MetricsSnapshot } from '../domain/dto/metrics-snapshot.dto';
/**
 * Metrics Endpoint Service
 *
 * @remarks
 * Собирает метрики из IMetricsCollectorPort и формирует JSON снапшот.
 * Не хранит состояние (stateless) для thread-safety.
 */
export declare class MetricsEndpointService {
    private readonly metrics;
    private readonly serviceName;
    private readonly serviceVersion;
    constructor(metrics: IMetricsCollectorPort, serviceName?: string, serviceVersion?: string);
    /**
     * Собрать снапшот метрик
     *
     * @remarks
     * Формирует полный снапшот с метаданными.
     * Используется для экспорта метрик в JSON формате.
     *
     * @returns Снапшот метрик
     */
    collect(): Promise<MetricsSnapshot>;
    /**
     * Конвертировать снапшот в JSON
     *
     * @param snapshot - Снапшот метрик
     * @returns JSON строка
     */
    toJson(snapshot: MetricsSnapshot): string;
    /**
     * Собрать метрики в виде plain object
     *
     * @remarks
     * Упрощённый формат для удобства чтения.
     *
     * @returns Plain object с метриками
     */
    toPlain(): Promise<Record<string, unknown>>;
    /**
     * Построить метаданные снапшота
     *
     * @returns Метаданные
     */
    private buildMetadata;
    /**
     * Получить текущие метрики
     *
     * @remarks
     * В текущей архитектуре метрики записываются в real-time,
     * не хранятся в коллекторе. Возвращаем пустой массив.
     *
     * TODO: добавить буферизацию метрик если потребуется
     *
     * @returns Массив метрик
     */
    private getCurrentMetrics;
    /**
     * Replacer для Date → ISO string
     *
     * @param _key - Ключ (не используется)
     * @param value - Значение
     * @returns Преобразованное значение
     */
    private dateReplacer;
}
