import type { CompanyMeta } from '../../interfaces';
import type {
  IOrganizationSearch,
  SearchParams,
  SearchResult
} from './ports/i-organization-search.port';
import type { IQueryExecutor } from './ports/i-query-executor.port';
import type { ISummaryChecker } from './ports/i-summary-checker.port';
import { SearchParamsBuilder } from './search-params.builder';
import { SearchWhereBuilder } from './search-where.builder';
import { SortMapper } from './sort-mapper';

/**
 * Параметры для сборки WHERE условия
 */
interface WhereBuildParams {
  region?: string;
  hasGeo?: string;
  minRevenue?: number;
  maxRevenue?: number;
  minAge?: number;
  maxAge?: number;
  minCharterCapital?: number;
  hasDirector?: boolean;
  hasName?: boolean;
  status?: string;
  hasOkvedColumn: boolean;
  okved?: string;
  search: string;
}

/**
 * Извлеченные параметры поиска
 */
interface ExtractedSearchParams {
  offset: number;
  hasOkvedColumn: boolean;
  sortBy: string;
  sortOrder: string;
}

/**
 * Service для поиска организаций
 *
 * @remarks
 * Реализует Port IOrganizationSearch.
 * Использует dependency inversion через Ports.
 */
export class OrganizationSearchService implements IOrganizationSearch {
  constructor(
    private readonly summaryChecker: ISummaryChecker,
    private readonly queryExecutor: IQueryExecutor
  ) {}

  /**
   * Выполняет поиск организаций
   */
  async search(params: SearchParams): Promise<SearchResult> {
    const { ready, hasOkvedColumn } = await this.summaryChecker.check();

    if (!ready) {
      return { data: [], total: 0 };
    }

    const searchParams = this.extractSearchParams(params, hasOkvedColumn);
    const queryParams = this.buildQueryParams(params, searchParams);
    const whereClause = this.buildWhereClause(params, searchParams);

    const sortColSummary = SortMapper.mapToSummaryColumn(searchParams.sortBy);

    const [total, data] = await Promise.all([
      this.queryExecutor.executeCount(whereClause, queryParams),
      this.queryExecutor.executeSelect(
        whereClause,
        sortColSummary,
        searchParams.sortOrder,
        queryParams,
        searchParams.hasOkvedColumn
      )
    ]);

    return { data, total };
  }

  /**
   * Извлекает и валидирует параметры поиска
   */
  private extractSearchParams(
    params: SearchParams,
    hasOkvedColumn: boolean
  ): ExtractedSearchParams {
    const {
      page = 1,
      limit = 50,
      sortBy = 'records_count',
      sortOrder = 'DESC'
    } = params;

    const offset = (page - 1) * limit;

    return {
      offset,
      hasOkvedColumn,
      sortBy: SortMapper.validateSortField(sortBy),
      sortOrder: SortMapper.validateSortOrder(sortOrder)
    };
  }

  /**
   * Строит параметры запроса
   */
  private buildQueryParams(
    params: SearchParams,
    searchParams: ExtractedSearchParams
  ): Record<string, string | number | string[] | undefined> {
    const {
      search = '',
      region,
      minRevenue,
      maxRevenue,
      minAge,
      maxAge,
      minCharterCapital,
      status,
      okved
    } = params;

    const builder = new SearchParamsBuilder()
      .withLimit(params.limit ?? 50)
      .withOffset(searchParams.offset)
      .withSearch(search);

    if (region) builder.withRegion(region);
    if (minRevenue !== undefined) builder.withMinRevenue(minRevenue);
    if (maxRevenue !== undefined) builder.withMaxRevenue(maxRevenue);
    if (minAge !== undefined) builder.withMinAge(minAge);
    if (maxAge !== undefined) builder.withMaxAge(maxAge);
    if (minCharterCapital !== undefined) {
      builder.withMinCharterCapital(minCharterCapital);
    }
    if (status) builder.withStatus(status);
    if (okved) builder.withOkved(okved);

    return builder.build();
  }

  /**
   * Строит WHERE условие на основе параметров
   */
  private buildWhereClause(
    params: SearchParams,
    searchParams: ExtractedSearchParams
  ): string {
    const {
      search = '',
      region,
      hasGeo,
      minRevenue,
      maxRevenue,
      minAge,
      maxAge,
      minCharterCapital,
      hasDirector,
      hasName,
      status,
      okved
    } = params;

    const builder = new SearchWhereBuilder();

    if (region) builder.addRegion();
    if (hasGeo === 'true') builder.addHasGeo();
    if (minRevenue !== undefined) builder.addMinRevenue();
    if (maxRevenue !== undefined) builder.addMaxRevenue();
    if (minAge !== undefined) builder.addMinAge();
    if (maxAge !== undefined) builder.addMaxAge();
    if (minCharterCapital !== undefined) builder.addMinCharterCapital();
    if (hasDirector === true) builder.addHasDirector();
    if (hasName === true) builder.addHasName();
    if (status) builder.addStatus();
    if (searchParams.hasOkvedColumn && okved && okved.trim()) {
      builder.addOkvedPrefix();
    }

    if (search) {
      const isNumericSearch = /^\d+$/.test(search);
      if (isNumericSearch) {
        builder.addNumericSearch();
      } else {
        builder.addTextSearch();
      }
    }

    return builder.build();
  }
}
