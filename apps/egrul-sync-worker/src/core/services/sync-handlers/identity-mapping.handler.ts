/**
 * Handler: Identity Mapping Stage
 *
 * @remarks
 * Выполняет построение identity mapping в автоматическом режиме.
 * Выбирает incremental/full на основе наличия предыдущей синхронизации.
 */

import type { ISyncStageHandler, SyncStageContext } from '../../ports/sync-stage-handler.interface';
import type { IIdentityMappingPort } from '../../ports/i-identity-mapping.port';
import type { ISyncStateStoragePort } from '../../ports/i-sync-state-storage.port';
import type { IProgressReporterPort } from '../../ports/i-progress-reporter-readable.port';

export class IdentityMappingHandler implements ISyncStageHandler {
  readonly stageName = 'identity_mapping';

  constructor(
    private readonly identityMapping: IIdentityMappingPort,
    private readonly syncStateStorage: ISyncStateStoragePort,
    private readonly progressReporter: IProgressReporterPort
  ) {}

  async execute(context: SyncStageContext): Promise<void> {
    const { forceFullSync = false } = context;

    await this.progressReporter.report(
      this.progressReporter.createState('running', 40, 'Определение режима построения identity mapping...')
    );

    const SYNC_TYPE = 'identity_mapping';
    let mode: 'full' | 'incremental';

    if (forceFullSync) {
      mode = 'full';
      console.log('[IdentityMapping] Forced FULL rebuild mode');
    } else {
      const lastSync = await this.syncStateStorage.getLastSyncTimestamp(SYNC_TYPE);
      mode = lastSync ? 'incremental' : 'full';

      const modeText =
        mode === 'full'
          ? 'FULL (первый запуск)'
          : `INCREMENTAL (с ${lastSync?.toISOString()})`;
      console.log(`[IdentityMapping] Автоматический выбор режима: ${modeText}`);
    }

    await this.progressReporter.report(
      this.progressReporter.createState(
        'running',
        42,
        `Построение identity mapping (${mode.toUpperCase()} режим)...`
      )
    );

    await this.identityMapping.build(mode);
  }
}
