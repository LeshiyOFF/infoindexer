/**
 * Graceful Shutdown Service
 *
 * @remarks
 * Управляет корректным завершением работы приложения.
 * Следует SRP: отвечает только за координацию shutdown.
 * Делегирует сохранение состояния и закрытие ресурсов соответствующим зависимостям.
 */
import type { IGracefulShutdown, ShutdownContext, ShutdownResult } from '../ports';
/**
 * Сервис для управления корректным завершением работы
 */
export declare class GracefulShutdownService implements IGracefulShutdown {
    private readonly saveProgress;
    private readonly closeConnections;
    private isShuttingDownFlag;
    private readonly handlers;
    constructor(saveProgress: () => Promise<number>, closeConnections: () => Promise<void>);
    /**
     * Инициирует graceful shutdown
     */
    shutdown(context: ShutdownContext): Promise<ShutdownResult>;
    /**
     * Проверяет, происходит ли завершение
     */
    isShuttingDown(): boolean;
    /**
     * Регистрирует callback для pre-shutdown действий
     */
    registerHandler(name: string, handler: () => Promise<void>): void;
    /**
     * Удаляет handler
     */
    unregisterHandler(name: string): void;
}
