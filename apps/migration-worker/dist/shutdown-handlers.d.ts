/**
 * Migration Worker Shutdown Handlers
 *
 * @remarks
 * Обрабатывает сигналы завершения работы.
 * Следует SRP: только обработка shutdown.
 */
import type { AppDependencies } from './app-initializer';
/**
 * Обрабатывает сигнал завершения работы
 *
 * @param signal - Название сигнала (SIGINT, SIGTERM)
 * @param deps - Dependencies приложения
 *
 * @remarks
 * - Логирует начало shutdown
 * - Закрывает соединения
 * - Завершает процесс с кодом 0 или 1
 */
export declare function handleShutdown(signal: string, deps: AppDependencies): Promise<void>;
/**
 * Регистрирует обработчики сигналов
 *
 * @param deps - Dependencies приложения
 *
 * @remarks
 * Регистрирует обработчики для SIGINT и SIGTERM.
 */
export declare function registerShutdownHandlers(deps: AppDependencies): void;
