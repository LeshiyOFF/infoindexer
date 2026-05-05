/**
 * Transform Handler
 *
 * @remarks
 * SyncOrchestrator stage handler that runs full staging →
 * production transform via ITransformService.transformAll().
 *
 * Replaces the previous DenormalizationHandler + MergerHandler
 * pair (NO-OP after Migration 022 + Commit 4) with explicit
 * SQL-based transform.
 *
 * Stage flow:
 *   IdentityMapping → Transform (this handler) → Cleanup
 *
 * Failure semantics: if any of the three transform sub-steps
 * (companies/directors/founders) fails, the handler throws —
 * staging tables are NOT truncated, allowing retry from the
 * same staging data.
 */
import type { ISyncStageHandler, SyncStageContext } from '../../ports/sync-stage-handler.interface';
import type { ITransformService } from '../../domain/ports/i-transform-service.port';
import type { IProgressReporterPort } from '../../ports/i-progress-reporter-readable.port';

export class TransformHandler implements ISyncStageHandler {
  readonly stageName = 'transform';

  constructor(
    private readonly transformService: ITransformService,
    private readonly progressReporter: IProgressReporterPort
  ) {}

  async execute(_context: SyncStageContext): Promise<void> {
    await this.progressReporter.report(
      this.progressReporter.createState('running', 60, 'Перенос staging → production...')
    );

    const results = await this.transformService.transformAll();

    const failures = results.filter(r => !r.success);
    if (failures.length > 0) {
      const messages = failures
        .map(r => `${r.tableName}: ${r.error ?? 'unknown error'}`)
        .join('; ');
      throw new Error(`Transform failed: ${messages}`);
    }
  }
}
