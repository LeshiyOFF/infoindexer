"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickHouseOrganizationById = void 0;
const financial_summary_1 = require("../../../domain/financial-summary");
const array_util_1 = require("../../../utils/array.util");
/**
 * Adapter для получения организации по ID через ClickHouse
 */
class ClickHouseOrganizationById {
    client;
    connections;
    constructor(client, connections) {
        this.client = client;
        this.connections = connections;
    }
    async findById(id) {
        const [data, meta, sanctions] = await Promise.all([
            this.fetchFinancialReports(id),
            this.fetchMetadata(id),
            this.fetchSanctions(id)
        ]);
        const connections = meta ? await this.fetchConnections(meta, id) : [];
        const summary = await this.fetchSummary(id).catch((error) => {
            console.warn(`[ClickHouseOrganizationById] Summary fetch failed for ${id}:`, error);
            return undefined;
        });
        return { data, meta, connections, sanctions, summary };
    }
    async fetchSummary(id) {
        const result = await this.client.query({
            query: 'SELECT * FROM financial_reports_summary WHERE inn = {id: String} LIMIT 1',
            query_params: { id },
            format: 'JSONEachRow'
        });
        const rows = await result.json();
        if (rows.length === 0)
            return undefined;
        const mapResult = this.mapRowToFinancialSummary(rows[0]);
        return mapResult.match({
            ok: (summary) => summary,
            err: (error) => {
                console.warn(`[ClickHouseOrganizationById] Summary mapping failed for INN ${id}:`, error.message);
                return undefined;
            }
        });
    }
    mapRowToFinancialSummary(row) {
        const revenue = Number(row.revenue ?? 0);
        const netProfit = Number(row.net_profit ?? 0);
        const charterCapital = Number(row.charter_capital ?? 0);
        return financial_summary_1.FinancialSummary.create({
            inn: String(row.inn),
            ogrn: row.ogrn ? String(row.ogrn) : undefined,
            region: row.region ? String(row.region) : undefined,
            latestYear: Number(row.latest_year ?? 0),
            recordsCount: Number(row.records_count ?? 0),
            revenue: { amount: revenue, currency: 'RUB' },
            netProfit: { amount: netProfit, currency: 'RUB' },
            charterCapital: { amount: charterCapital, currency: 'RUB' },
            age: row.age ? Number(row.age) : undefined,
            okved: row.okved ? String(row.okved) : undefined,
            hasGeo: row.has_geo ? Number(row.has_geo) === 1 : undefined,
            lon: row.lon ? String(row.lon) : undefined,
            lat: row.lat ? String(row.lat) : undefined
        });
    }
    async fetchFinancialReports(id) {
        const result = await this.client.query({
            query: 'SELECT * FROM financial_reports WHERE inn = {id: String} OR (inn = \'\' AND ogrn = {id: String}) ORDER BY year DESC',
            query_params: { id },
            format: 'JSONEachRow'
        });
        const json = await result.json();
        return array_util_1.ArrayUtil.ensureArray(json);
    }
    async fetchMetadata(id) {
        const result = await this.client.query({
            query: 'SELECT * FROM companies_meta WHERE inn = {id: String} LIMIT 1',
            query_params: { id },
            format: 'JSONEachRow'
        });
        const json = await result.json();
        const records = array_util_1.ArrayUtil.ensureArray(json);
        return records.length > 0 ? records[0] : null;
    }
    async fetchSanctions(id) {
        try {
            const result = await this.client.query({
                query: 'SELECT id, inn, program, program_id as programId, authority, country, toString(start_date) as startDate, toString(end_date) as endDate, source_url as sourceUrl, if(end_date IS NULL OR end_date > today(), 1, 0) as isActive FROM company_sanctions WHERE inn = {id: String} ORDER BY start_date DESC',
                query_params: { id },
                format: 'JSONEachRow'
            });
            const json = await result.json();
            const rows = array_util_1.ArrayUtil.ensureArray(json);
            return rows.map(r => ({
                id: String(r.id),
                inn: String(r.inn),
                program: String(r.program),
                programId: String(r.programId),
                authority: String(r.authority),
                country: String(r.country),
                startDate: String(r.startDate),
                endDate: r.endDate ? String(r.endDate) : null,
                sourceUrl: String(r.sourceUrl),
                isActive: Number(r.isActive) === 1
            }));
        }
        catch {
            return [];
        }
    }
    async fetchConnections(meta, inn) {
        const { director, founders } = meta;
        return this.connections.findByDirectorOrFounders({
            director: director || '',
            founders: founders || [],
            inn
        });
    }
}
exports.ClickHouseOrganizationById = ClickHouseOrganizationById;
