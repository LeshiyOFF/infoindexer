"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationService = void 0;
const adapters_factory_1 = require("./organization-search/adapters.factory");
const CACHE_NOT_READY_ERROR = 'Кэш не готов. Обновите кэш в настройках.';
/**
 * Facade для работы с организациями
 *
 * @remarks
 * Оркестратор, который использует Ports через Factory.
 * Обеспечивает обратную совместимость с существующим API.
 */
class OrganizationService {
    organizationSearch;
    organizationById;
    constructor(client) {
        const factory = new adapters_factory_1.ClickHouseAdapterFactory(client);
        this.organizationSearch = factory.createOrganizationSearch();
        this.organizationById = factory.createOrganizationById();
    }
    /**
     * Поиск организаций с пагинацией и фильтрацией
     */
    async search(params) {
        const { page = 1, limit = 50 } = params;
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
    async getById(id) {
        return this.organizationById.findById(id);
    }
}
exports.OrganizationService = OrganizationService;
