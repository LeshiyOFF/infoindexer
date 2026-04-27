import type { ClickHouseClient } from '@clickhouse/client';
import type {
  IConnections,
  IOrganizationById,
  IOrganizationSearch,
  IQueryExecutor,
  ISummaryChecker
} from './ports';
import {
  ClickHouseConnections,
  ClickHouseOrganizationById,
  ClickHouseQueryExecutor,
  ClickHouseSummaryChecker
} from './adapters';
import { OrganizationSearchService } from './organization-search.service';

/**
 * Factory для создания адаптеров ClickHouse
 *
 * @remarks
 * Централизует создание зависимостей.
 * Упрощает тестирование через подмену зависимостей.
 */
export class ClickHouseAdapterFactory {
  constructor(private readonly client: ClickHouseClient) {}

  /**
   * Создаёт checker для summary таблицы
   */
  createSummaryChecker(): ISummaryChecker {
    return new ClickHouseSummaryChecker(this.client);
  }

  /**
   * Создаёт executor для запросов
   */
  createQueryExecutor(): IQueryExecutor {
    return new ClickHouseQueryExecutor(this.client);
  }

  /**
   * Создаёт сервис поиска связей
   */
  createConnections(): IConnections {
    return new ClickHouseConnections(this.client);
  }

  /**
   * Создаёт порт для поиска организаций
   */
  createOrganizationSearch(): IOrganizationSearch {
    return new OrganizationSearchService(
      this.createSummaryChecker(),
      this.createQueryExecutor()
    );
  }

  /**
   * Создаёт порт для получения организации по ID
   */
  createOrganizationById(): IOrganizationById {
    return new ClickHouseOrganizationById(
      this.client,
      this.createConnections()
    );
  }
}
