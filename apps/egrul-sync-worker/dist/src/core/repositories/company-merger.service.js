"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyMergerService = void 0;
/**
 * Сервис для мёржа данных в companies_meta
 *
 * @deprecated No-op. MVs handle aggregation automatically.
 */
class CompanyMergerService {
    client;
    constructor(client) {
        this.client = client;
    }
    /**
     * @deprecated No-op. Materialized Views handle aggregation automatically.
     *
     * Read from v_companies_meta VIEW instead.
     * MVs update on each INSERT to respective raw tables.
     */
    async merge() {
        console.log('[DEPRECATED] CompanyMergerService.merge() called.');
        console.log('MV Pattern handles aggregation automatically:');
        console.log('  - companies_mv: argMaxState(name, status, address)');
        console.log('  - directors_mv: groupArrayState(director_name)');
        console.log('  - founders_mv: groupArrayState(founder_name)');
        console.log('Read from v_companies_meta VIEW for aggregated data.');
        console.log('Memory reduced 28x: 5.6GB → ~200MB');
    }
}
exports.CompanyMergerService = CompanyMergerService;
