import type { IOrganizationById } from './ports/i-organization-by-id.port';
import type { FinancialSummary } from '../../domain/financial-summary';

/**
 * Service для получения организации по ID
 *
 * @remarks
 * Реализует бизнес-логику для работы с отдельной организацией.
 * Использует IOrganizationById порт через Dependency Inversion.
 */
export class OrganizationByIdService {
  constructor(private readonly organizationById: IOrganizationById) {}

  /**
   * Получает финансовую сводку организации по ИНН
   *
   * @param inn - ИНН организации
   * @returns FinancialSummary или null если не найдена
   */
  async getFinancialSummary(inn: string): Promise<FinancialSummary | null> {
    const result = await this.organizationById.findById(inn);
    return result.summary ?? null;
  }
}
