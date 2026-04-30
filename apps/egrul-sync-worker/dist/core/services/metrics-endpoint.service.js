"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsEndpointService = void 0;
const os_1 = __importDefault(require("os"));
/**
 * Metrics Endpoint Service
 *
 * @remarks
 * Собирает метрики из IMetricsCollectorPort и формирует JSON снапшот.
 * Не хранит состояние (stateless) для thread-safety.
 */
class MetricsEndpointService {
    metrics;
    serviceName;
    serviceVersion;
    constructor(metrics, serviceName = 'egrul-sync-worker', serviceVersion) {
        this.metrics = metrics;
        this.serviceName = serviceName;
        this.serviceVersion = serviceVersion || process.env.npm_package_version || '1.0.0';
    }
    /**
     * Собрать снапшот метрик
     *
     * @remarks
     * Формирует полный снапшот с метаданными.
     * Используется для экспорта метрик в JSON формате.
     *
     * @returns Снапшот метрик
     */
    async collect() {
        const metadata = this.buildMetadata();
        // В текущей архитектуре IMetricsCollectorPort не хранит историю
        // Поэтому возвращаем пустой массив метрик
        // Реальные метрики собираются в момент записи (recordGauge и т.д.)
        const metrics = await this.getCurrentMetrics();
        return Object.freeze({
            timestamp: new Date(),
            metrics,
            metadata: Object.freeze(metadata)
        });
    }
    /**
     * Конвертировать снапшот в JSON
     *
     * @param snapshot - Снапшот метрик
     * @returns JSON строка
     */
    toJson(snapshot) {
        return JSON.stringify(snapshot, this.dateReplacer, 2);
    }
    /**
     * Собрать метрики в виде plain object
     *
     * @remarks
     * Упрощённый формат для удобства чтения.
     *
     * @returns Plain object с метриками
     */
    async toPlain() {
        const snapshot = await this.collect();
        return {
            service: snapshot.metadata.service,
            version: snapshot.metadata.version,
            hostname: snapshot.metadata.hostname,
            timestamp: snapshot.timestamp.toISOString(),
            metrics_count: snapshot.metrics.length
        };
    }
    /**
     * Построить метаданные снапшота
     *
     * @returns Метаданные
     */
    buildMetadata() {
        return {
            service: this.serviceName,
            version: this.serviceVersion,
            hostname: os_1.default.hostname(),
            extra: {
                platform: os_1.default.platform(),
                arch: os_1.default.arch(),
                node_version: process.version
            }
        };
    }
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
    async getCurrentMetrics() {
        // В текущей реализации ConsoleMetricsAdapter не хранит метрики
        // Для сохранения метрик нужен BufferingMetricsAdapter
        return [];
    }
    /**
     * Replacer для Date → ISO string
     *
     * @param _key - Ключ (не используется)
     * @param value - Значение
     * @returns Преобразованное значение
     */
    dateReplacer(_key, value) {
        if (value instanceof Date) {
            return value.toISOString();
        }
        return value;
    }
}
exports.MetricsEndpointService = MetricsEndpointService;
