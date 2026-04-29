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
import type { ISyncStageHandler, SyncStageContext } from '../../ports/sync-stage-handler.interface';
import type { IProgressReporterPort } from '../../ports/i-progress-reporter-readable.port';
/**
 * Handler: Merger Stage
 *
 * @remarks No-op handler - MVs auto-update on INSERT.
 * Preserved for pipeline compatibility (stage = 'merger').
 */
export declare class MergerHandler implements ISyncStageHandler {
    private readonly progressReporter;
    readonly stageName = "merger";
    constructor(progressReporter: IProgressReporterPort);
    execute(_context: SyncStageContext): Promise<void>;
}
