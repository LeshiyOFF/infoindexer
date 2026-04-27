"use strict";
/**
 * Service: Sync Orchestrator
 *
 * @remarks
 * Оркестрирует выполнение этапов синхронизации.
 * Следует Open/Closed Principle: новые этапы добавляются через композицию.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncOrchestrator = void 0;
class SyncOrchestrator {
    handlers;
    constructor(...handlers) {
        this.handlers = handlers;
    }
    /**
     * Выполняет все этапы синхронизации по порядку
     *
     * @throws Ошибка любого этапа прерывает всю цепочку
     */
    async executeAll(context) {
        for (const handler of this.handlers) {
            console.log(`[Orchestrator] Starting stage: ${handler.stageName}`);
            await handler.execute(context);
            console.log(`[Orchestrator] Completed stage: ${handler.stageName}`);
        }
    }
    /**
     * Выполняет конкретный этап по имени
     *
     * @param stageName - Имя этапа для выполнения
     * @throws Error если этап не найден
     */
    async executeStage(stageName, context) {
        const handler = this.handlers.find(h => h.stageName === stageName);
        if (!handler) {
            throw new Error(`Stage handler not found: ${stageName}`);
        }
        await handler.execute(context);
    }
}
exports.SyncOrchestrator = SyncOrchestrator;
