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
 * Менеджер активных синхронизаций
 */
export declare class ActiveSyncsManager {
    private readonly active;
    /**
     * Регистрирует новую синхронизацию
     *
     * @returns Контроллер для прерывания
     */
    register(year: number, orchestrator: SyncOrchestrator): AbortController;
    /**
     * Удаляет синхронизацию из активных
     */
    unregister(year: number): void;
    /**
     * Прерывает синхронизацию по году
     */
    abort(year: number): boolean;
    /**
     * Сохраняет чекпоинты всех активных синхронизаций
     *
     * @remarks
     * Вызывается при graceful shutdown.
     */
    saveAllCheckpoints(): Promise<void>;
    /**
     * Прерывает все активные синхронизации
     */
    abortAll(): void;
    /**
     * Проверяет наличие активных синхронизаций
     */
    hasActiveSyncs(): boolean;
    /**
     * Возвращает количество активных синхронизаций
     */
    get count(): number;
}
