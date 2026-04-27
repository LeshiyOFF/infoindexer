/**
 * Handler: Denormalization Stage
 *
 * @remarks
 * @deprecated Materialized Views handle aggregation automatically.
 *
 * MV Pattern eliminates need for separate denormalization stage:
 * - Direct insert to egrul_directors_denormalized → directors_mv auto-updates
 * - Direct insert to egrul_founders_denormalized → founders_mv auto-updates
 * - No JOIN/prepareDirectors/prepareFounders needed
 *
 * Memory reduction: 5.6GB → ~200MB (28x)
 */
import type { ISyncStageHandler, SyncStageContext } from '../../ports/sync-stage-handler.interface';
import type { DenormalizationService } from '../../services/denormalization.service';
import type { IProgressReporterPort } from '../../ports/i-progress-reporter-readable.port';
/**
 * Handler: Denormalization Stage (Deprecated)
 *
 * @deprecated No-op. Direct insert + MV auto-update replaces denormalization.
 */
export declare class DenormalizationHandler implements ISyncStageHandler {
    private readonly denormalization;
    private readonly progressReporter;
    readonly stageName = "denormalization";
    constructor(denormalization: DenormalizationService, progressReporter: IProgressReporterPort);
    execute(_context: SyncStageContext): Promise<void>;
}
