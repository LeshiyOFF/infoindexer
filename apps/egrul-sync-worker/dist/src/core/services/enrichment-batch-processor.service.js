"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrichmentBatchProcessor = void 0;
const constants_1 = require("../../config/constants");
/**
 * Сервис для батч-обработки enrichment
 */
class EnrichmentBatchProcessor {
    dadata;
    fuzzy;
    persons;
    mappings;
    constructor(dadata, fuzzy, persons, mappings) {
        this.dadata = dadata;
        this.fuzzy = fuzzy;
        this.persons = persons;
        this.mappings = mappings;
    }
    /**
     * Обрабатывает батч INN
     */
    async processBatch(inns) {
        const results = [];
        for (const inn of inns) {
            try {
                const matched = await this.enrichSingleInn(inn);
                results.push({ inn, matched });
            }
            catch {
                results.push({ inn, matched: false });
            }
        }
        const matched = results.filter((r) => r.matched).length;
        const failed = results.filter((r) => !r.matched).length;
        return { processed: inns.length, matched, failed };
    }
    /**
     * Обогащает один INN через DaData + fuzzy matching
     */
    async enrichSingleInn(inn) {
        const dadataResult = await this.dadata.lookupPersonByInn(inn);
        if (!dadataResult || !dadataResult.fio) {
            return false;
        }
        const persons = await this.persons.fetchAllPersons();
        const match = this.fuzzy.findBestMatch(dadataResult.fio, persons, constants_1.ENRICHMENT_MAX_DISTANCE);
        if (!match || match.confidence < constants_1.ENRICHMENT_MIN_CONFIDENCE) {
            return false;
        }
        await this.mappings.insertMapping(inn, match.id, match.confidence);
        return true;
    }
}
exports.EnrichmentBatchProcessor = EnrichmentBatchProcessor;
