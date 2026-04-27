"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityMappingService = void 0;
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
class IdentityMappingService {
    client;
    batchProcessor;
    config;
    incrementalBuilder;
    circuitBreakerManager;
    /**
     * Создаёт сервис identity mapping
     *
     * @param client - ClickHouse клиент
     * @param batchProcessor - Порт для батч-обработки
     * @param config - Конфигурация батчинга
     * @param incrementalBuilder - Порт для инкрементальных обновлений
     * @param circuitBreakerManager - Circuit Breaker Manager (опционально)
     */
    constructor(client, batchProcessor, config, incrementalBuilder, circuitBreakerManager) {
        this.client = client;
        this.batchProcessor = batchProcessor;
        this.config = config;
        this.incrementalBuilder = incrementalBuilder;
        this.circuitBreakerManager = circuitBreakerManager;
    }
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
    async build(mode = 'full') {
        if (mode === 'incremental') {
            return await this.incrementalBuilder.build('incremental');
        }
        return await this.buildFull();
    }
    /**
     * Полная перестройка identity mapping
     *
     * @remarks
     * Очищает таблицу и вставляет все записи батчами.
     *
     * @returns Результат с числом обработанных записей
     */
    async buildFull() {
        console.log('[IdentityMapping] Building identity mapping (FULL mode)...');
        const startTime = Date.now();
        await this.clearTable();
        await this.insertPersonEntityMappingBatched();
        await this.insertCompanyEntityMappingBatched();
        await this.insertCompanyInnMappingBatched();
        const durationMs = Date.now() - startTime;
        // Получаем точное количество обработанных записей
        const counts = await this.getCounts();
        console.log('[IdentityMapping] Full build completed!');
        return {
            personsProcessed: counts.persons,
            companiesProcessed: counts.companies,
            durationMs
        };
    }
    /**
     * Получает количество записей в identity_mapping по типам
     *
     * @returns Количество persons и companies
     */
    async getCounts() {
        const result = await this.client.query({
            query: `
        SELECT
          countIf(id_type = 'person_entity') as persons,
          countIf(id_type IN ('company_entity', 'company_inn')) as companies
        FROM egrul_identity_mapping
      `,
            format: 'JSONEachRow'
        });
        const rows = await result.json();
        const row = rows[0];
        return {
            persons: parseInt(row.persons, 10),
            companies: parseInt(row.companies, 10)
        };
    }
    /**
     * Очищает таблицу identity_mapping
     *
     * @remarks
     * Обеспечивает идемпотентность метода build().
     */
    async clearTable() {
        await this.client.command({
            query: 'TRUNCATE TABLE IF EXISTS egrul_identity_mapping'
        });
    }
    /**
     * Вставляет Person entity UUID → canonical mapping батчами
     *
     * @remarks
     * ORDER BY id обеспечивает детерминированный батчинг.
     * Прогресс логируется после каждого батча.
     * Заищено circuit breaker если доступен.
     */
    async insertPersonEntityMappingBatched() {
        const breakerName = 'identity:persons';
        const executeBatch = async () => {
            const query = `
        INSERT INTO egrul_identity_mapping (id_type, raw_id, canonical_id, entity_type, source, confidence, created_at, updated_at)
        SELECT
          'person_entity' as id_type,
          id as raw_id,
          inn as canonical_id,
          'person' as entity_type,
          'staging' as source,
          1.0 as confidence,
          now() as created_at,
          now() as updated_at
        FROM egrul_staging_companies
        WHERE inn != ''
        ORDER BY id
        LIMIT {limit:UInt32}
        OFFSET {offset}
        SETTINGS max_execution_time = 120, max_memory_usage = 6000000000, max_threads = 4
      `;
            await this.batchProcessor.processInBatches(query, this.config, (p) => this.logProgress('Persons (from staging)', p));
        };
        if (this.circuitBreakerManager && this.circuitBreakerManager.has(breakerName)) {
            const result = await this.circuitBreakerManager.execute(breakerName, executeBatch);
            if (!result.success) {
                throw new Error(`Circuit breaker blocked: ${breakerName} - ${result.error}`);
            }
        }
        else {
            await executeBatch();
        }
    }
    /**
     * Вставляет Company entity UUID → INN mapping батчами
     *
     * @remarks
     * ORDER BY id обеспечивает детерминированный батчинг.
     * Заищено circuit breaker если доступен.
     */
    async insertCompanyEntityMappingBatched() {
        const breakerName = 'identity:companies';
        const executeBatch = async () => {
            const query = `
        INSERT INTO egrul_identity_mapping (id_type, raw_id, canonical_id, entity_type, source, confidence, created_at, updated_at)
        SELECT
          'company_entity' as id_type,
          id as raw_id,
          inn as canonical_id,
          'company' as entity_type,
          'direct_entity' as source,
          1.0 as confidence,
          now() as created_at,
          now() as updated_at
        FROM egrul_companies_raw
        ORDER BY id
        LIMIT {limit:UInt32}
        OFFSET {offset}
        SETTINGS max_execution_time = 120, max_memory_usage = 6000000000, max_threads = 4
      `;
            await this.batchProcessor.processInBatches(query, this.config, (p) => this.logProgress('Companies (entity)', p));
        };
        if (this.circuitBreakerManager && this.circuitBreakerManager.has(breakerName)) {
            const result = await this.circuitBreakerManager.execute(breakerName, executeBatch);
            if (!result.success) {
                throw new Error(`Circuit breaker blocked: ${breakerName} - ${result.error}`);
            }
        }
        else {
            await executeBatch();
        }
    }
    /**
     * Вставляет Company INN direct mapping батчами
     *
     * @remarks
     * ORDER BY inn обеспечивает детерминированный батчинг.
     * Заищено circuit breaker если доступен.
     */
    async insertCompanyInnMappingBatched() {
        const breakerName = 'identity:inn';
        const executeBatch = async () => {
            const query = `
        INSERT INTO egrul_identity_mapping (id_type, raw_id, canonical_id, entity_type, source, confidence, created_at, updated_at)
        SELECT
          'company_inn' as id_type,
          inn as raw_id,
          inn as canonical_id,
          'company' as entity_type,
          'direct_inn' as source,
          1.0 as confidence,
          now() as created_at,
          now() as updated_at
        FROM egrul_companies_raw
        ORDER BY inn
        LIMIT {limit:UInt32}
        OFFSET {offset}
        SETTINGS max_execution_time = 120, max_memory_usage = 6000000000, max_threads = 4
      `;
            await this.batchProcessor.processInBatches(query, this.config, (p) => this.logProgress('Companies (INN)', p));
        };
        if (this.circuitBreakerManager && this.circuitBreakerManager.has(breakerName)) {
            const result = await this.circuitBreakerManager.execute(breakerName, executeBatch);
            if (!result.success) {
                throw new Error(`Circuit breaker blocked: ${breakerName} - ${result.error}`);
            }
        }
        else {
            await executeBatch();
        }
    }
    /**
     * Логирует прогресс батч-обработки
     *
     * @remarks
     * Единый метод для всех трёх операций (DRY).
     */
    logProgress(source, progress) {
        console.log(`[${source}] ${progress.percentage.toFixed(1)}% complete (${progress.processedRows}/${progress.totalRows})`);
    }
}
exports.IdentityMappingService = IdentityMappingService;
