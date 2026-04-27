/**
 * Migration Worker Shutdown Handlers
 *
 * @remarks
 * Обрабатывает сигналы завершения работы.
 * Следует SRP: только обработка shutdown.
 */

import type { AppDependencies } from './app-initializer';
import { closeConnections } from './app-initializer';

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
export async function handleShutdown(
  signal: string,
  deps: AppDependencies
): Promise<void> {
  console.log(`Received ${signal}, shutting down gracefully...`);

  try {
    await closeConnections(deps);
    console.log('Shutdown completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}

/**
 * Регистрирует обработчики сигналов
 *
 * @param deps - Dependencies приложения
 *
 * @remarks
 * Регистрирует обработчики для SIGINT и SIGTERM.
 */
export function registerShutdownHandlers(deps: AppDependencies): void {
  process.on('SIGINT', () => handleShutdown('SIGINT', deps));
  process.on('SIGTERM', () => handleShutdown('SIGTERM', deps));

  // Логируем неожиданные ошибки
  process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    handleShutdown('UNCAUGHT_EXCEPTION', deps).catch(() => process.exit(1));
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled rejection at:', promise, 'reason:', reason);
    handleShutdown('UNHANDLED_REJECTION', deps).catch(() => process.exit(1));
  });
}
