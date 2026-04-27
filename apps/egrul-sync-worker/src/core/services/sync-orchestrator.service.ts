/**
 * Service: Sync Orchestrator
 *
 * @remarks
 * Оркестрирует выполнение этапов синхронизации.
 * Следует Open/Closed Principle: новые этапы добавляются через композицию.
 */

import type { ISyncStageHandler, SyncStageContext } from '../ports/sync-stage-handler.interface';

export class SyncOrchestrator {
  private readonly handlers: ISyncStageHandler[];

  constructor(...handlers: ISyncStageHandler[]) {
    this.handlers = handlers;
  }

  /**
   * Выполняет все этапы синхронизации по порядку
   *
   * @throws Ошибка любого этапа прерывает всю цепочку
   */
  async executeAll(context: SyncStageContext): Promise<void> {
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
  async executeStage(stageName: string, context: SyncStageContext): Promise<void> {
    const handler = this.handlers.find(h => h.stageName === stageName);
    if (!handler) {
      throw new Error(`Stage handler not found: ${stageName}`);
    }
    await handler.execute(context);
  }
}
