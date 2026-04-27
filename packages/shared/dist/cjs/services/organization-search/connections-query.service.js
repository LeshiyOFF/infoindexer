"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionsQueryService = void 0;
/**
 * Сервис для поиска связанных организаций
 */
class ConnectionsQueryService {
    client;
    constructor(client) {
        this.client = client;
    }
    /**
     * Находит организации, связанные через директора или учредителей
     */
    async findByDirectorOrFounders(params) {
        const { director, founders, inn } = params;
        if (!director && founders.length === 0) {
            return [];
        }
        const query = this.buildQuery(founders.length > 0);
        const queryParams = this.buildParams(director, founders, inn);
        try {
            const result = await this.client.query({
                query,
                query_params: queryParams,
                format: 'JSONEachRow'
            });
            const json = await result.json();
            return this.ensureArray(json);
        }
        catch (error) {
            console.error('ConnectionsQueryService error:', error);
            return [];
        }
    }
    /**
     * Строит SQL запрос для поиска связей
     */
    buildQuery(hasFounders) {
        const baseQuery = `
      SELECT cm.inn, any(cm.name) AS name, any(cm.director) AS director, any(cm.status) AS status
      FROM companies_meta cm
      INNER JOIN (SELECT DISTINCT inn FROM financial_reports WHERE inn != '') fr ON cm.inn = fr.inn
      WHERE ((cm.director != '' AND cm.director = {director: String})
    `;
        const foundersCondition = hasFounders
            ? ` OR hasAny(cm.founders, {founders: Array(String)})`
            : '';
        return baseQuery + foundersCondition + `) AND cm.inn != {id: String} GROUP BY cm.inn LIMIT 10`;
    }
    /**
     * Строит параметры запроса
     */
    buildParams(director, founders, inn) {
        const params = {
            director,
            id: inn
        };
        if (founders.length > 0) {
            params.founders = founders;
        }
        return params;
    }
    /**
     * Гарантирует, что результат является массивом
     */
    ensureArray(value) {
        return Array.isArray(value) ? value : [];
    }
}
exports.ConnectionsQueryService = ConnectionsQueryService;
