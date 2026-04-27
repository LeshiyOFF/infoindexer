import { ClickHouseClient } from '@clickhouse/client';
import { CompanyMeta, FinancialReport, ApiResponse } from '../interfaces';
import type { SanctionDTO } from '../domain/entities';
import {
  ClickHouseAdapterFactory
} from './organization-search/adapters.factory';
import type {
  IOrganizationById,
  IOrganizationSearch,
  SearchParams
} from './organization-search/ports';

const CACHE_NOT_READY_ERROR = 'Кэш не готов. Обновите кэш в настройках.';

/**
 * Facade для работы с организациями
 *
 * @remarks
 * Оркестратор, который использует Ports через Factory.
 * Обеспечивает обратную совместимость с существующим API.
 */
export class OrganizationService {
  private readonly organizationSearch: IOrganizationSearch;
  private readonly organizationById: IOrganizationById;

  constructor(client: ClickHouseClient) {
    const factory = new ClickHouseAdapterFactory(client);
    this.organizationSearch = factory.createOrganizationSearch();
    this.organizationById = factory.createOrganizationById();
  }

  /**
   * Поиск организаций с пагинацией и фильтрацией
   */
  async search(params: SearchParams): Promise<ApiResponse<CompanyMeta[]>> {
    const {
      page = 1,
      limit = 50
    } = params;

    const result = await this.organizationSearch.search(params);

    if (result.data.length === 0 && result.total === 0) {
      return {
        data: [],
        pagination: { total: 0, page, limit, totalPages: 0 },
        error: CACHE_NOT_READY_ERROR
      };
    }

    return {
      data: result.data,
      pagination: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit)
      }
    };
  }

  /**
   * Получение организации по ИНН с финансовыми отчётами и связями
   */
  async getById(id: string): Promise<{
    data: FinancialReport[];
    meta: CompanyMeta | null;
    connections: Partial<CompanyMeta>[];
    sanctions: readonly SanctionDTO[];
  }> {
    return this.organizationById.findById(id);
  }
}
