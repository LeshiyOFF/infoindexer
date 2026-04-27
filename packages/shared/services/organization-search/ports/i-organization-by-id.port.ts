import type { FinancialReport, CompanyMeta } from '../../../interfaces';
import type { SanctionDTO } from '../../../domain/entities';
import type { FinancialSummary } from '../../../domain/financial-summary';

/**
 * Результат получения организации по ID
 */
export interface OrganizationByIdResult {
  readonly data: FinancialReport[];
  readonly meta: CompanyMeta | null;
  readonly connections: Partial<CompanyMeta>[];
  readonly sanctions: readonly SanctionDTO[];
  readonly summary?: FinancialSummary;
}

/**
 * Port для получения организации по идентификатору
 *
 * @remarks
 * Интерфейс (Port) в терминологии Hexagonal Architecture.
 */
export interface IOrganizationById {
  /**
   * Получает организацию по ИНН/ОГРН
   *
   * @param id - ИНН или ОГРН организации
   * @returns Данные организации с отчётами, метаданными и связями
   */
  findById(id: string): Promise<OrganizationByIdResult>;
}
