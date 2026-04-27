import type { IOrganizationSearch, SearchParams, SearchResult } from './ports/i-organization-search.port';
import type { IQueryExecutor } from './ports/i-query-executor.port';
import type { ISummaryChecker } from './ports/i-summary-checker.port';
/**
 * Service для поиска организаций
 *
 * @remarks
 * Реализует Port IOrganizationSearch.
 * Использует dependency inversion через Ports.
 */
export declare class OrganizationSearchService implements IOrganizationSearch {
    private readonly summaryChecker;
    private readonly queryExecutor;
    constructor(summaryChecker: ISummaryChecker, queryExecutor: IQueryExecutor);
    /**
     * Выполняет поиск организаций
     */
    search(params: SearchParams): Promise<SearchResult>;
    /**
     * Извлекает и валидирует параметры поиска
     */
    private extractSearchParams;
    /**
     * Строит параметры запроса
     */
    private buildQueryParams;
    /**
     * Строит WHERE условие на основе параметров
     */
    private buildWhereClause;
}
