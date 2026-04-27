import type { ClickHouseClient } from '@clickhouse/client';
import type { ISanctionStorage, ISanctionAggregation } from './ports';
import { ClickHouseSanctionsRepository } from './clickhouse-sanctions.repository';
import { AggregationHelper } from './mappers/aggregation-helper';

/**
 * Factory для создания компонентов работы с санкциями
 *
 * @remarks
 * Реализует Dependency Inversion Principle (DIP) из SOLID.
 * Клиентский код зависит от Port интерфейсов, а не от конкретных реализаций.
 *
 * @example
 * ```ts
 * const factory = new SanctionsFactory(clickHouseClient);
 * const storage = factory.createStorage();
 * const sanctions = await storage.findByInn('1234567890');
 * ```
 */
export class SanctionsFactory {
  constructor(private readonly client: ClickHouseClient) {}

  /**
   * Создаёт адаптер для хранения санкций
   *
   * @returns Реализация Port ISanctionStorage
   */
  createStorage(): ISanctionStorage {
    return new ClickHouseSanctionsRepository(this.client);
  }

  /**
   * Создаёт адаптер для агрегации по санкциям
   *
   * @returns Реализация Port ISanctionAggregation
   */
  createAggregation(): ISanctionAggregation {
    return new AggregationHelper(this.client);
  }
}
