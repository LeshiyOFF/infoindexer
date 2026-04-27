"use strict";
/**
 * Менеджер активных синхронизаций
 *
 * @remarks
 * Presentation слой. Управляет активными синхронизациями,
 * обеспечивает корректный graceful shutdown с сохранением чекпоинтов.
 * Следует SRP: отвечает только за управление жизненным циклом синхронизаций.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActiveSyncsManager = void 0;
/**
 * Менеджер активных синхронизаций
 */
class ActiveSyncsManager {
    active = new Map();
    /**
     * Регистрирует новую синхронизацию
     *
     * @returns Контроллер для прерывания
     */
    register(year, orchestrator) {
        const controller = new AbortController();
        this.active.set(year, { orchestrator, controller });
        return controller;
    }
    /**
     * Удаляет синхронизацию из активных
     */
    unregister(year) {
        this.active.delete(year);
    }
    /**
     * Прерывает синхронизацию по году
     */
    abort(year) {
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
    async saveAllCheckpoints() {
        const savePromises = Array.from(this.active.values()).map(async ({ orchestrator }) => {
            try {
                await orchestrator.saveCheckpoint();
            }
            catch (error) {
                console.error('Failed to save checkpoint:', error);
            }
        });
        await Promise.all(savePromises);
    }
    /**
     * Прерывает все активные синхронизации
     */
    abortAll() {
        for (const [year, { controller }] of this.active.entries()) {
            controller.abort();
            console.log(`Aborted sync for year ${year}`);
        }
    }
    /**
     * Проверяет наличие активных синхронизаций
     */
    hasActiveSyncs() {
        return this.active.size > 0;
    }
    /**
     * Возвращает количество активных синхронизаций
     */
    get count() {
        return this.active.size;
    }
}
exports.ActiveSyncsManager = ActiveSyncsManager;
