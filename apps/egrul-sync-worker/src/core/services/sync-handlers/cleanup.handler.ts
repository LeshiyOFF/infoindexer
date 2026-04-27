/**
 * Handler: Cleanup Stage
 *
 * @remarks
 * Выполняет очистку временных таблиц после синхронизации.
 */

import type { ISyncStageHandler, SyncStageContext } from '../../ports/sync-stage-handler.interface';
import type { ClickHouseRepository } from '../../repositories/clickhouse.repository';

export class CleanupHandler implements ISyncStageHandler {
  readonly stageName = 'cleanup';

  constructor(private readonly repository: ClickHouseRepository) {}

  async execute(_context: SyncStageContext): Promise<void> {
    console.log('Cleaning up temporary tables...');
    await this.repository.cleanupRawTables();
  }
}
