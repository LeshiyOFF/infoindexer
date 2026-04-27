/**
 * Service for building SQL queries for identity mapping
 *
 * @remarks
 * Следует SRP: только построение SQL запросов.
 * Избегает дублирования через template-based подход.
 *
 * Query types:
 * - person_entity: mapping from egrul_persons_raw
 * - company_entity: mapping from egrul_companies_raw (by id)
 * - company_inn: mapping from egrul_companies_raw (by inn)
 */
export declare class IdentityQueryBuilderService {
    private static readonly PERSON_ENTITY;
    private static readonly COMPANY_ENTITY;
    private static readonly COMPANY_INN;
    buildPersonQuery(withFilter: boolean): string;
    buildCompanyEntityQuery(withFilter: boolean): string;
    buildCompanyInnQuery(withFilter: boolean): string;
    private buildInsertQuery;
}
