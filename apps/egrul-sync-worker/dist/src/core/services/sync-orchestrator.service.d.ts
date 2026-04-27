/**
 * Service: Sync Orchestrator
 *
 * @remarks
 * Оркестрирует выполнение этапов синхронизации.
 * Следует Open/Closed Principle: новые этапы добавляются через композицию.
 */
import type { ISyncStageHandler, SyncStageContext } from '../ports/sync-stage-handler.interface';
export declare class SyncOrchestrator {
    private readonly handlers;
    constructor(...handlers: ISyncStageHandler[]);
    /**
     * Выполняет все этапы синхронизации по порядку
     *
     * @throws Ошибка любого этапа прерывает всю цепочку
     */
    executeAll(context: SyncStageContext): Promise<void>;
    /**
     * Выполняет конкретный этап по имени
     *
     * @param stageName - Имя этапа для выполнения
     * @throws Error если этап не найден
     */
    executeStage(stageName: string, context: SyncStageContext): Promise<void>;
}
