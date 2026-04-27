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
export class DenormalizationHandler implements ISyncStageHandler {
  readonly stageName = 'denormalization';

  constructor(
    private readonly denormalization: DenormalizationService,
    private readonly progressReporter: IProgressReporterPort
  ) {}

  async execute(_context: SyncStageContext): Promise<void> {
    await this.progressReporter.report(
      this.progressReporter.createState(
        'running',
        45,
        'Direct insert + MV auto-update (no denormalization needed)'
      )
    );
    // No-op: Direct insert + MV handles aggregation
    await this.denormalization.run(); // Logs deprecation notice
  }
}
