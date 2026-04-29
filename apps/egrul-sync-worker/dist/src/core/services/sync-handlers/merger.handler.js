"use strict";
/**
 * Handler: Merger Stage
 *
 * @remarks
 * Materialized Views handle aggregation automatically.
 *
 * MV Pattern eliminates need for separate merge stage:
 * - companies_mv: argMaxState(name, status, address) on INSERT
 * - directors_mv: groupArrayState(director_name) on INSERT
 * - founders_mv: groupArrayState(founder_name) on INSERT
 * - v_companies_meta: VIEW that JOINs all 3 MVs
 *
 * Memory reduction: 5.6GB → ~200MB (28x)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MergerHandler = void 0;
/**
 * Handler: Merger Stage
 *
 * @remarks No-op handler - MVs auto-update on INSERT.
 * Preserved for pipeline compatibility (stage = 'merger').
 */
class MergerHandler {
    progressReporter;
    stageName = 'merger';
    constructor(progressReporter) {
        this.progressReporter = progressReporter;
    }
    async execute(_context) {
        await this.progressReporter.report(this.progressReporter.createState('running', 55, 'MV auto-update enabled (no merge needed)'));
        // MVs handle aggregation automatically on each INSERT
        // Read from v_companies_meta VIEW for aggregated data
    }
}
exports.MergerHandler = MergerHandler;
