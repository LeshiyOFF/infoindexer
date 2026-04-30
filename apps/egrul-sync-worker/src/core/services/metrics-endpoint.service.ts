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
import type {
  Metric,
  MetricsSnapshot,
  MetricsMetadata
} from '../domain/dto/metrics-snapshot.dto';
import os from 'os';

/**
 * Metrics Endpoint Service
 *
 * @remarks
 * Собирает метрики из IMetricsCollectorPort и формирует JSON снапшот.
 * Не хранит состояние (stateless) для thread-safety.
 */
export class MetricsEndpointService {
  private readonly serviceName: string;
  private readonly serviceVersion: string;

  constructor(
    private readonly metrics: IMetricsCollectorPort,
    serviceName: string = 'egrul-sync-worker',
    serviceVersion?: string
  ) {
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
  async collect(): Promise<MetricsSnapshot> {
    const metadata = this.buildMetadata();

    // В текущей архитектуре IMetricsCollectorPort не хранит историю
    // Поэтому возвращаем пустой массив метрик
    // Реальные метрики собираются в момент записи (recordGauge и т.д.)
    const metrics: readonly Metric[] = await this.getCurrentMetrics();

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
  toJson(snapshot: MetricsSnapshot): string {
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
  async toPlain(): Promise<Record<string, unknown>> {
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
  private buildMetadata(): MetricsMetadata {
    return {
      service: this.serviceName,
      version: this.serviceVersion,
      hostname: os.hostname(),
      extra: {
        platform: os.platform(),
        arch: os.arch(),
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
  private async getCurrentMetrics(): Promise<readonly Metric[]> {
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
  private dateReplacer(_key: string, value: unknown): unknown {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  }
}
