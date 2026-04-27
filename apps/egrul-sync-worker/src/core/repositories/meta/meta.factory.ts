import type { ClickHouseClient } from '@clickhouse/client';
import type { IMetaStorage } from './ports';
import { ClickHouseMetaRepository } from './clickhouse-meta.repository';

/**
 * Factory для создания компонентов работы с meta tables
 *
 * @remarks
 * Реализует Dependency Inversion Principle (DIP) из SOLID.
 */
export class MetaFactory {
  constructor(private readonly client: ClickHouseClient) {}

  /**
   * Создаёт адаптер для хранения meta данных
   *
   * @returns Реализация Port IMetaStorage
   */
  createStorage(): IMetaStorage {
    return new ClickHouseMetaRepository(this.client);
  }
}
