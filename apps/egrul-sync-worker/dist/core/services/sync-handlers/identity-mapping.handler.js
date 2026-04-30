"use strict";
/**
 * Handler: Identity Mapping Stage
 *
 * @remarks
 * Выполняет построение identity mapping в автоматическом режиме.
 * Выбирает incremental/full на основе наличия предыдущей синхронизации.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityMappingHandler = void 0;
class IdentityMappingHandler {
    identityMapping;
    syncStateStorage;
    progressReporter;
    stageName = 'identity_mapping';
    constructor(identityMapping, syncStateStorage, progressReporter) {
        this.identityMapping = identityMapping;
        this.syncStateStorage = syncStateStorage;
        this.progressReporter = progressReporter;
    }
    async execute(context) {
        const { forceFullSync = false } = context;
        await this.progressReporter.report(this.progressReporter.createState('running', 40, 'Определение режима построения identity mapping...'));
        const SYNC_TYPE = 'identity_mapping';
        let mode;
        if (forceFullSync) {
            mode = 'full';
            console.log('[IdentityMapping] Forced FULL rebuild mode');
        }
        else {
            const lastSync = await this.syncStateStorage.getLastSyncTimestamp(SYNC_TYPE);
            mode = lastSync ? 'incremental' : 'full';
            const modeText = mode === 'full'
                ? 'FULL (первый запуск)'
                : `INCREMENTAL (с ${lastSync?.toISOString()})`;
            console.log(`[IdentityMapping] Автоматический выбор режима: ${modeText}`);
        }
        await this.progressReporter.report(this.progressReporter.createState('running', 42, `Построение identity mapping (${mode.toUpperCase()} режим)...`));
        await this.identityMapping.build(mode);
    }
}
exports.IdentityMappingHandler = IdentityMappingHandler;
