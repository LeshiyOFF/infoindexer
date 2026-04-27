"use strict";
/**
 * Handler: Merger Stage
 *
 * @remarks
 * @deprecated Materialized Views handle aggregation automatically.
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
 * Handler: Merger Stage (Deprecated)
 *
 * @deprecated No-op. MVs auto-update on INSERT.
 */
class MergerHandler {
    merger;
    progressReporter;
    stageName = 'merger';
    constructor(merger, progressReporter) {
        this.merger = merger;
        this.progressReporter = progressReporter;
    }
    async execute(_context) {
        await this.progressReporter.report(this.progressReporter.createState('running', 55, 'MV auto-update enabled (no merge needed)'));
        // No-op: MVs handle aggregation automatically
        await this.merger.merge(); // Logs deprecation notice
    }
}
exports.MergerHandler = MergerHandler;
