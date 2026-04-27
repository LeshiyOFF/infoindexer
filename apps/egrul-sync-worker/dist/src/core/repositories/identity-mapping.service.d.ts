import type { ClickHouseClient } from '@clickhouse/client';
import type { IBatchProcessorPort } from './ports/i-batch-processor.port';
import type { BatchConfig } from '../domain/value-objects/batch-config.vo';
import type { IIncrementalIdentityPort, IdentityMappingResult } from './ports/i-incremental-identity.port';
import type { ICircuitBreakerManagerPort } from '../ports/i-circuit-breaker-manager.port';
/**
 * Сервис для работы с identity mapping
 *
 * @remarks
 * Рефакторен для использования батч-обработки и инкрементальных обновлений.
 * Обрабатывает 161M записей (~32 батча) вместо монолитного INSERT.
 * Поддерживает два режима: full rebuild и incremental update.
 * Защищён Circuit Breaker от каскадных сбоев.
 * Профиль памяти:
 *   - До: 5-7GB за один запрос → OOM
 *   - После: ~200MB за батч → в пределах лимитов
 *   - Incremental: только новые записи → <200MB
 *
 * Следует SRP: оркестрирует построение identity mapping.
 * Следует DIP: зависит от абстракций IBatchProcessorPort, IIncrementalIdentityPort, ICircuitBreakerManagerPort.
 */
export declare class IdentityMappingService {
    private readonly client;
    private readonly batchProcessor;
    private readonly config;
    private readonly incrementalBuilder;
    private readonly circuitBreakerManager?;
    /**
     * Создаёт сервис identity mapping
     *
     * @param client - ClickHouse клиент
     * @param batchProcessor - Порт для батч-обработки
     * @param config - Конфигурация батчинга
     * @param incrementalBuilder - Порт для инкрементальных обновлений
     * @param circuitBreakerManager - Circuit Breaker Manager (опционально)
     */
    constructor(client: ClickHouseClient, batchProcessor: IBatchProcessorPort, config: BatchConfig, incrementalBuilder: IIncrementalIdentityPort, circuitBreakerManager?: ICircuitBreakerManagerPort | undefined);
    /**
     * Строит identity mapping для разрешения разных форматов ID
     * Phase A: только entity-based ссылки (без внешнего enrichment)
     *
     * @remarks
     * Поддерживает два режима:
     * - 'full': полная перезапись (TRUNCATE + INSERT)
     * - 'incremental': только новые записи (first_seen > last_sync)
     *
     * Идемпотентен: безопасен для многократного вызова.
     * ReplacingMergeTree автоматически дедуплицирует записи.
     *
     * @param mode - Режим построения ('full' или 'incremental')
     * @returns Результат с числом обработанных записей
     */
    build(mode?: 'full' | 'incremental'): Promise<IdentityMappingResult>;
    /**
     * Полная перестройка identity mapping
     *
     * @remarks
     * Очищает таблицу и вставляет все записи батчами.
     *
     * @returns Результат с числом обработанных записей
     */
    private buildFull;
    /**
     * Получает количество записей в identity_mapping по типам
     *
     * @returns Количество persons и companies
     */
    private getCounts;
    /**
     * Очищает таблицу identity_mapping
     *
     * @remarks
     * Обеспечивает идемпотентность метода build().
     */
    private clearTable;
    /**
     * Вставляет Person entity UUID → canonical mapping батчами
     *
     * @remarks
     * ORDER BY id обеспечивает детерминированный батчинг.
     * Прогресс логируется после каждого батча.
     * Заищено circuit breaker если доступен.
     */
    private insertPersonEntityMappingBatched;
    /**
     * Вставляет Company entity UUID → INN mapping батчами
     *
     * @remarks
     * ORDER BY id обеспечивает детерминированный батчинг.
     * Заищено circuit breaker если доступен.
     */
    private insertCompanyEntityMappingBatched;
    /**
     * Вставляет Company INN direct mapping батчами
     *
     * @remarks
     * ORDER BY inn обеспечивает детерминированный батчинг.
     * Заищено circuit breaker если доступен.
     */
    private insertCompanyInnMappingBatched;
    /**
     * Логирует прогресс батч-обработки
     *
     * @remarks
     * Единый метод для всех трёх операций (DRY).
     */
    private logProgress;
}
