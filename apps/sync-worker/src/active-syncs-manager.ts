/**
 * Менеджер активных синхронизаций
 *
 * @remarks
 * Presentation слой. Управляет активными синхронизациями,
 * обеспечивает корректный graceful shutdown с сохранением чекпоинтов.
 * Следует SRP: отвечает только за управление жизненным циклом синхронизаций.
 */

import type { SyncOrchestrator } from './core/domain';

/**
 * Контекст активной синхронизации
 */
interface ActiveSync {
  readonly orchestrator: SyncOrchestrator;
  readonly controller: AbortController;
}

/**
 * Менеджер активных синхронизаций
 */
export class ActiveSyncsManager {
  private readonly active = new Map<number, ActiveSync>();

  /**
   * Регистрирует новую синхронизацию
   *
   * @returns Контроллер для прерывания
   */
  register(year: number, orchestrator: SyncOrchestrator): AbortController {
    const controller = new AbortController();
    this.active.set(year, { orchestrator, controller });
    return controller;
  }

  /**
   * Удаляет синхронизацию из активных
   */
  unregister(year: number): void {
    this.active.delete(year);
  }

  /**
   * Прерывает синхронизацию по году
   */
  abort(year: number): boolean {
    const sync = this.active.get(year);
    if (sync) {
      sync.controller.abort();
      return true;
    }
    return false;
  }

  /**
   * Сохраняет чекпоинты всех активных синхронизаций
   *
   * @remarks
   * Вызывается при graceful shutdown.
   */
  async saveAllCheckpoints(): Promise<void> {
    const savePromises = Array.from(this.active.values()).map(async ({ orchestrator }) => {
      try {
        await orchestrator.saveCheckpoint();
      } catch (error) {
        console.error('Failed to save checkpoint:', error);
      }
    });

    await Promise.all(savePromises);
  }

  /**
   * Прерывает все активные синхронизации
   */
  abortAll(): void {
    for (const [year, { controller }] of this.active.entries()) {
      controller.abort();
      console.log(`Aborted sync for year ${year}`);
    }
  }

  /**
   * Проверяет наличие активных синхронизаций
   */
  hasActiveSyncs(): boolean {
    return this.active.size > 0;
  }

  /**
   * Возвращает количество активных синхронизаций
   */
  get count(): number {
    return this.active.size;
  }
}
