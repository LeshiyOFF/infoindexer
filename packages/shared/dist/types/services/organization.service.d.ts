import { ClickHouseClient } from '@clickhouse/client';
import { CompanyMeta, FinancialReport, ApiResponse } from '../interfaces';
import type { SanctionDTO } from '../domain/entities';
import type { SearchParams } from './organization-search/ports';
/**
 * Facade для работы с организациями
 *
 * @remarks
 * Оркестратор, который использует Ports через Factory.
 * Обеспечивает обратную совместимость с существующим API.
 */
export declare class OrganizationService {
    private readonly organizationSearch;
    private readonly organizationById;
    constructor(client: ClickHouseClient);
    /**
     * Поиск организаций с пагинацией и фильтрацией
     */
    search(params: SearchParams): Promise<ApiResponse<CompanyMeta[]>>;
    /**
     * Получение организации по ИНН с финансовыми отчётами и связями
     */
    getById(id: string): Promise<{
        data: FinancialReport[];
        meta: CompanyMeta | null;
        connections: Partial<CompanyMeta>[];
        sanctions: readonly SanctionDTO[];
    }>;
}
