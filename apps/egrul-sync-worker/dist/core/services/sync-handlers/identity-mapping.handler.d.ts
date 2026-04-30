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
export declare class IdentityMappingHandler implements ISyncStageHandler {
    private readonly identityMapping;
    private readonly syncStateStorage;
    private readonly progressReporter;
    readonly stageName = "identity_mapping";
    constructor(identityMapping: IIdentityMappingPort, syncStateStorage: ISyncStateStoragePort, progressReporter: IProgressReporterPort);
    execute(context: SyncStageContext): Promise<void>;
}
