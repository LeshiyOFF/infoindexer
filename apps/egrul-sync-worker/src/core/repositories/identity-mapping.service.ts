/**
 * ═══════════════════════════════════════════════════════════════════
 * ARCHITECTURE NOTE: Identity Mapping Data Source
 * ═══════════════════════════════════════════════════════════════════
 * Identity mapping reads from egrul_staging_entities (migration 022)
 * for all entity types. Records are filtered by 'schema' column:
 *
 *   - Person method:   schema = 'Person'
 *   - Company methods: schema IN ('Company', 'Organization', 'LegalEntity')
 *
 * History:
 *   - Migration 015 deprecated egrul_companies_raw (id column removed).
 *   - Migration 021 introduced staging+transform pattern with
 *     egrul_staging_companies.
 *   - Migration 022 introduced unified egrul_staging_entities table
 *     for all FTM entity types (including Person without INN).
 *
 * The legacy egrul_staging_companies table will be dropped in a
 * future cleanup migration after this code is in production.
 * ═══════════════════════════════════════════════════════════════════
 */
import type { ClickHouseClient } from '@clickhouse/client';
import type { IBatchProcessorPort } from './ports/i-batch-processor.port';
import type { BatchConfig } from '../domain/value-objects/batch-config.vo';
import type { BatchProgress } from './ports/i-batch-processor.port';
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
export class IdentityMappingService {
  /**
   * Создаёт сервис identity mapping
   *
   * @param client - ClickHouse клиент
   * @param batchProcessor - Порт для батч-обработки
   * @param config - Конфигурация батчинга
   * @param incrementalBuilder - Порт для инкрементальных обновлений
   * @param circuitBreakerManager - Circuit Breaker Manager (опционально)
   */
  constructor(
    private readonly client: ClickHouseClient,
    private readonly batchProcessor: IBatchProcessorPort,
    private readonly config: BatchConfig,
    private readonly incrementalBuilder: IIncrementalIdentityPort,
    private readonly circuitBreakerManager?: ICircuitBreakerManagerPort
  ) {}

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
  async build(mode: 'full' | 'incremental' = 'full'): Promise<IdentityMappingResult> {
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
  private async buildFull(): Promise<IdentityMappingResult> {
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
  private async getCounts(): Promise<{ persons: number; companies: number }> {
    const result = await this.client.query({
      query: `
        SELECT
          countIf(id_type = 'person_entity') as persons,
          countIf(id_type IN ('company_entity', 'company_inn')) as companies
        FROM egrul_identity_mapping
      `,
      format: 'JSONEachRow'
    });

    const rows = await result.json() as [{ persons: string; companies: string }];
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
  private async clearTable(): Promise<void> {
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
  private async insertPersonEntityMappingBatched(): Promise<void> {
    const breakerName = 'identity:persons';

    const executeBatch = async (): Promise<void> => {
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
        FROM egrul_staging_entities
        WHERE schema = 'Person'
          AND inn IS NOT NULL
        ORDER BY id
        LIMIT {limit:UInt32}
        OFFSET {offset}
        SETTINGS max_execution_time = 120, max_memory_usage = 6000000000, max_threads = 4
      `;

      await this.batchProcessor.processInBatches(
        query,
        this.config,
        (p) => this.logProgress('Persons (from staging)', p)
      );
    };

    if (this.circuitBreakerManager && this.circuitBreakerManager.has(breakerName)) {
      const result = await this.circuitBreakerManager.execute(breakerName, executeBatch);
      if (!result.success) {
        throw new Error(`Circuit breaker blocked: ${breakerName} - ${result.error}`);
      }
    } else {
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
  private async insertCompanyEntityMappingBatched(): Promise<void> {
    const breakerName = 'identity:companies';

    const executeBatch = async (): Promise<void> => {
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
        FROM egrul_staging_entities
        WHERE schema IN ('Company', 'Organization', 'LegalEntity')
          AND inn IS NOT NULL
        ORDER BY id
        LIMIT {limit:UInt32}
        OFFSET {offset}
        SETTINGS max_execution_time = 120, max_memory_usage = 6000000000, max_threads = 4
      `;

      await this.batchProcessor.processInBatches(
        query,
        this.config,
        (p) => this.logProgress('Companies (entity)', p)
      );
    };

    if (this.circuitBreakerManager && this.circuitBreakerManager.has(breakerName)) {
      const result = await this.circuitBreakerManager.execute(breakerName, executeBatch);
      if (!result.success) {
        throw new Error(`Circuit breaker blocked: ${breakerName} - ${result.error}`);
      }
    } else {
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
  private async insertCompanyInnMappingBatched(): Promise<void> {
    const breakerName = 'identity:inn';

    const executeBatch = async (): Promise<void> => {
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
        FROM egrul_staging_entities
        WHERE schema IN ('Company', 'Organization', 'LegalEntity')
          AND inn IS NOT NULL
        ORDER BY inn
        LIMIT {limit:UInt32}
        OFFSET {offset}
        SETTINGS max_execution_time = 120, max_memory_usage = 6000000000, max_threads = 4
      `;

      await this.batchProcessor.processInBatches(
        query,
        this.config,
        (p) => this.logProgress('Companies (INN)', p)
      );
    };

    if (this.circuitBreakerManager && this.circuitBreakerManager.has(breakerName)) {
      const result = await this.circuitBreakerManager.execute(breakerName, executeBatch);
      if (!result.success) {
        throw new Error(`Circuit breaker blocked: ${breakerName} - ${result.error}`);
      }
    } else {
      await executeBatch();
    }
  }

  /**
   * Логирует прогресс батч-обработки
   *
   * @remarks
   * Единый метод для всех трёх операций (DRY).
   */
  private logProgress(source: string, progress: BatchProgress): void {
    console.log(`[${source}] ${progress.percentage.toFixed(1)}% complete (${progress.processedRows}/${progress.totalRows})`);
  }
}
