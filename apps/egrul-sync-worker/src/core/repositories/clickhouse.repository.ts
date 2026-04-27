import type { ClickHouseClient } from '@clickhouse/client';
import type {
  EgrulCompanyRow,
  EgrulDirectorshipRow,
  EgrulOwnershipRow,
  EgrulPersonRow
} from '../entities';
import type {
  EgrulDirectorRow,
  EgrulFounderRow
} from '../domain/entities';
import type {
  ISanctionRepository,
  SanctionRow,
  SanctionStats
} from 'shared/repositories/sanction.repository';
import type { SanctionDTO } from 'shared/domain/entities';
import type { ISanctionStorage } from './sanctions/ports';
import type { IMetaStorage, SupportedRow } from './meta/ports';
import { MetaFactory } from './meta/meta.factory';
import { SanctionsFactory } from './sanctions/sanctions.factory';

/**
 * Union type for all supported row types
 * Re-exported from port for convenience
 */
export type { SupportedRow };

/**
 * Facade для работы с ClickHouse
 *
 * @remarks
 * Объединяет все репозитории в единую точку входа.
 * Использует Factory для создания зависимостей (Dependency Inversion).
 *
 * Таблицы создаются через миграции при старте приложения (index.ts).
 *
 * @example
 * ```ts
 * const repo = new ClickHouseRepository(client);
 * await repo.insertBatch('egrul_companies_raw', companies);
 * const sanctions = await repo.sanctions.findByInn('1234567890');
 * ```
 */
export class ClickHouseRepository implements ISanctionRepository {
  readonly meta: IMetaStorage;
  readonly sanctions: ISanctionStorage;
  private readonly sanctionsFactory: SanctionsFactory;

  constructor(private readonly client: ClickHouseClient) {
    const metaFactory = new MetaFactory(client);
    this.meta = metaFactory.createStorage();
    this.sanctionsFactory = new SanctionsFactory(client);
    this.sanctions = this.sanctionsFactory.createStorage();
  }

  // ===============================
  // Meta methods (delegated)
  // ===============================

  /**
   * Вставляет батч записей в таблицу
   *
   * @remarks
   * Supports both legacy and MV row types.
   */
  async insertBatch(
    table: string,
    values: SupportedRow[]
  ): Promise<void> {
    await this.meta.insertBatch(table, values);
  }

  /**
   * Очищает временные raw таблицы
   */
  async cleanupRawTables(): Promise<void> {
    await this.meta.cleanupRawTables();
  }

  /**
   * Удаляет частично загруженные данные при abort
   *
   * @remarks
   * Делегирует в meta storage для очистки raw таблиц и identity_mapping.
   */
  async clearPartialData(): Promise<void> {
    await this.meta.clearPartialData();
  }

  // ===============================
  // ISanctionRepository Implementation (delegated)
  // ===============================

  async saveBatch(rows: readonly SanctionRow[]): Promise<void> {
    await this.sanctions.saveBatch(rows);
  }

  async findByInn(inn: string): Promise<readonly SanctionDTO[]> {
    return await this.sanctions.findByInn(inn);
  }

  async findByInns(inns: readonly string[]): Promise<Readonly<Record<string, readonly SanctionDTO[]>>> {
    return await this.sanctions.findByInns(inns);
  }

  async deleteByInn(inn: string): Promise<void> {
    await this.sanctions.deleteByInn(inn);
  }

  async getStats(): Promise<SanctionStats> {
    return await this.sanctions.getStats();
  }

  async exists(inn: string): Promise<boolean> {
    return await this.sanctions.exists(inn);
  }

  async getAllInns(limit?: number): Promise<readonly string[]> {
    return await this.sanctions.getAllInns(limit);
  }

  /**
   * Удаляет все санкции
   *
   * @remarks
   * Делегирует в sanctions storage для очистки всех санкций.
   */
  async deleteAll(): Promise<void> {
    await this.sanctions.deleteAll();
  }
}
