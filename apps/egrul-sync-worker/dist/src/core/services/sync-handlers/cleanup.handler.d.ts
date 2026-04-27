/**
 * Handler: Cleanup Stage
 *
 * @remarks
 * Выполняет очистку временных таблиц после синхронизации.
 */
import type { ISyncStageHandler, SyncStageContext } from '../../ports/sync-stage-handler.interface';
import type { ClickHouseRepository } from '../../repositories/clickhouse.repository';
export declare class CleanupHandler implements ISyncStageHandler {
    private readonly repository;
    readonly stageName = "cleanup";
    constructor(repository: ClickHouseRepository);
    execute(_context: SyncStageContext): Promise<void>;
}
