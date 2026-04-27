import type { IOrganizationById } from './ports/i-organization-by-id.port';
import type { FinancialSummary } from '../../domain/financial-summary';
/**
 * Service для получения организации по ID
 *
 * @remarks
 * Реализует бизнес-логику для работы с отдельной организацией.
 * Использует IOrganizationById порт через Dependency Inversion.
 */
export declare class OrganizationByIdService {
    private readonly organizationById;
    constructor(organizationById: IOrganizationById);
    /**
     * Получает финансовую сводку организации по ИНН
     *
     * @param inn - ИНН организации
     * @returns FinancialSummary или null если не найдена
     */
    getFinancialSummary(inn: string): Promise<FinancialSummary | null>;
}
