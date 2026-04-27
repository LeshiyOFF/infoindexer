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

import type { ISyncStageHandler, SyncStageContext } from '../../ports/sync-stage-handler.interface';
import type { CompanyMergerService } from '../../repositories/company-merger.service';
import type { IProgressReporterPort } from '../../ports/i-progress-reporter-readable.port';

/**
 * Handler: Merger Stage (Deprecated)
 *
 * @deprecated No-op. MVs auto-update on INSERT.
 */
export class MergerHandler implements ISyncStageHandler {
  readonly stageName = 'merger';

  constructor(
    private readonly merger: CompanyMergerService,
    private readonly progressReporter: IProgressReporterPort
  ) {}

  async execute(_context: SyncStageContext): Promise<void> {
    await this.progressReporter.report(
      this.progressReporter.createState(
        'running',
        55,
        'MV auto-update enabled (no merge needed)'
      )
    );
    // No-op: MVs handle aggregation automatically
    await this.merger.merge(); // Logs deprecation notice
  }
}
