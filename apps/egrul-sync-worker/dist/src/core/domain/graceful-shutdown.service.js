"use strict";
/**
 * Graceful Shutdown Service
 *
 * @remarks
 * Управляет корректным завершением работы приложения.
 * Следует SRP: отвечает только за координацию shutdown.
 * Делегирует сохранение состояния и закрытие ресурсов соответствующим зависимостям.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GracefulShutdownService = void 0;
/**
 * Сервис для управления корректным завершением работы
 */
class GracefulShutdownService {
    saveProgress;
    closeConnections;
    isShuttingDownFlag = false;
    handlers = new Map();
    constructor(saveProgress, closeConnections) {
        this.saveProgress = saveProgress;
        this.closeConnections = closeConnections;
    }
    /**
     * Инициирует graceful shutdown
     */
    async shutdown(context) {
        if (this.isShuttingDownFlag) {
            console.warn('[GracefulShutdown] Shutdown already in progress');
            return {
                success: false,
                elapsedMs: 0,
                operationsSaved: 0,
                connectionsClosed: false
            };
        }
        this.isShuttingDownFlag = true;
        const startTime = Date.now();
        console.log(`[GracefulShutdown] Received ${context.signal}, initiating shutdown...`);
        let operationsSaved = 0;
        let connectionsClosed = false;
        try {
            // 1. Выполняем зарегистрированные handlers
            for (const [name, { handler }] of this.handlers) {
                console.log(`[GracefulShutdown] Executing handler: ${name}`);
                await handler();
            }
            // 2. Сохраняем прогресс активных операций
            console.log('[GracefulShutdown] Saving active operations progress...');
            operationsSaved = await this.saveProgress();
            console.log(`[GracefulShutdown] Saved ${operationsSaved} operation(s)`);
            // 3. Закрываем соединения
            console.log('[GracefulShutdown] Closing connections...');
            await this.closeConnections();
            connectionsClosed = true;
            const elapsedMs = Date.now() - startTime;
            console.log(`[GracefulShutdown] Completed in ${elapsedMs}ms`);
            return {
                success: true,
                elapsedMs,
                operationsSaved,
                connectionsClosed
            };
        }
        catch (error) {
            console.error('[GracefulShutdown] Error during shutdown:', error);
            return {
                success: false,
                elapsedMs: Date.now() - startTime,
                operationsSaved,
                connectionsClosed
            };
        }
    }
    /**
     * Проверяет, происходит ли завершение
     */
    isShuttingDown() {
        return this.isShuttingDownFlag;
    }
    /**
     * Регистрирует callback для pre-shutdown действий
     */
    registerHandler(name, handler) {
        if (this.handlers.has(name)) {
            throw new Error(`Handler ${name} already registered`);
        }
        this.handlers.set(name, { name, handler });
        console.log(`[GracefulShutdown] Registered handler: ${name}`);
    }
    /**
     * Удаляет handler
     */
    unregisterHandler(name) {
        this.handlers.delete(name);
    }
}
exports.GracefulShutdownService = GracefulShutdownService;
