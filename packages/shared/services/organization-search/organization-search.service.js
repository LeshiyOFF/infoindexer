"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationSearchService = void 0;
const search_params_builder_1 = require("./search-params.builder");
const search_where_builder_1 = require("./search-where.builder");
const sort_mapper_1 = require("./sort-mapper");
/**
 * Service для поиска организаций
 *
 * @remarks
 * Реализует Port IOrganizationSearch.
 * Использует dependency inversion через Ports.
 */
class OrganizationSearchService {
    summaryChecker;
    queryExecutor;
    constructor(summaryChecker, queryExecutor) {
        this.summaryChecker = summaryChecker;
        this.queryExecutor = queryExecutor;
    }
    /**
     * Выполняет поиск организаций
     */
    async search(params) {
        const { ready, hasOkvedColumn } = await this.summaryChecker.check();
        if (!ready) {
            return { data: [], total: 0 };
        }
        const searchParams = this.extractSearchParams(params, hasOkvedColumn);
        const queryParams = this.buildQueryParams(params, searchParams);
        const whereClause = this.buildWhereClause(params, searchParams);
        const sortColSummary = sort_mapper_1.SortMapper.mapToSummaryColumn(searchParams.sortBy);
        const [total, data] = await Promise.all([
            this.queryExecutor.executeCount(whereClause, queryParams),
            this.queryExecutor.executeSelect(whereClause, sortColSummary, searchParams.sortOrder, queryParams, searchParams.hasOkvedColumn)
        ]);
        return { data, total };
    }
    /**
     * Извлекает и валидирует параметры поиска
     */
    extractSearchParams(params, hasOkvedColumn) {
        const { page = 1, limit = 50, sortBy = 'records_count', sortOrder = 'DESC' } = params;
        const offset = (page - 1) * limit;
        return {
            offset,
            hasOkvedColumn,
            sortBy: sort_mapper_1.SortMapper.validateSortField(sortBy),
            sortOrder: sort_mapper_1.SortMapper.validateSortOrder(sortOrder)
        };
    }
    /**
     * Строит параметры запроса
     */
    buildQueryParams(params, searchParams) {
        const { search = '', region, minRevenue, maxRevenue, minAge, maxAge, minCharterCapital, status, okved } = params;
        const builder = new search_params_builder_1.SearchParamsBuilder()
            .withLimit(params.limit ?? 50)
            .withOffset(searchParams.offset)
            .withSearch(search);
        if (region)
            builder.withRegion(region);
        if (minRevenue !== undefined)
            builder.withMinRevenue(minRevenue);
        if (maxRevenue !== undefined)
            builder.withMaxRevenue(maxRevenue);
        if (minAge !== undefined)
            builder.withMinAge(minAge);
        if (maxAge !== undefined)
            builder.withMaxAge(maxAge);
        if (minCharterCapital !== undefined) {
            builder.withMinCharterCapital(minCharterCapital);
        }
        if (status)
            builder.withStatus(status);
        if (okved)
            builder.withOkved(okved);
        return builder.build();
    }
    /**
     * Строит WHERE условие на основе параметров
     */
    buildWhereClause(params, searchParams) {
        const { search = '', region, hasGeo, minRevenue, maxRevenue, minAge, maxAge, minCharterCapital, hasDirector, hasName, status, okved } = params;
        const builder = new search_where_builder_1.SearchWhereBuilder();
        if (region)
            builder.addRegion();
        if (hasGeo === 'true')
            builder.addHasGeo();
        if (minRevenue !== undefined)
            builder.addMinRevenue();
        if (maxRevenue !== undefined)
            builder.addMaxRevenue();
        if (minAge !== undefined)
            builder.addMinAge();
        if (maxAge !== undefined)
            builder.addMaxAge();
        if (minCharterCapital !== undefined)
            builder.addMinCharterCapital();
        if (hasDirector === true)
            builder.addHasDirector();
        if (hasName === true)
            builder.addHasName();
        if (status)
            builder.addStatus();
        if (searchParams.hasOkvedColumn && okved && okved.trim()) {
            builder.addOkvedPrefix();
        }
        if (search) {
            const isNumericSearch = /^\d+$/.test(search);
            if (isNumericSearch) {
                builder.addNumericSearch();
            }
            else {
                builder.addTextSearch();
            }
        }
        return builder.build();
    }
}
exports.OrganizationSearchService = OrganizationSearchService;
