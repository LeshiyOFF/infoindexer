/**
 * Migration Worker Entry Point
 *
 * @remarks
 * Поддерживает два режима работы:
 * - once: применить миграции и завершиться (default, Docker standard)
 * - scheduled: запускать миграции по расписанию (legacy)
 *
 * Создаёт /tmp/migrations-completed при успехе для healthcheck.
 *
 * Следует SRP: только координация запуска.
 */

import { writeFileSync } from 'fs';
import { join } from 'path';
import { initializeApp, closeConnections } from './app-initializer';
import { registerShutdownHandlers } from './shutdown-handlers';
import type { AppDependencies } from './app-initializer';
import type { Lock } from 'shared/infrastructure/migrations/ports';

/**
 * Режим работы миграций
 */
enum MigrationMode {
  /** Применить один раз и завершиться (Docker init pattern) */
  Once = 'once',
  /** Запускать по расписанию (legacy daemon mode) */
  Scheduled = 'scheduled'
}

/**
 * Получить режим работы из переменной окружения
 */
function getMigrationMode(): MigrationMode {
  const mode = process.env.MIGRATION_MODE?.toLowerCase();
  return mode === 'scheduled' ? MigrationMode.Scheduled : MigrationMode.Once;
}

/**
 * Путь к файлу маркеру завершения
 */
const COMPLETION_MARKER_PATH = '/tmp/migrations-completed';

/**
 * Создаёт файл маркер завершения
 *
 * @param stats - Статистика выполнения миграций
 *
 * @remarks
 * Создаёт JSON файл с результатом выполнения миграций.
 * Используется docker healthcheck для определения успешного завершения.
 */
function createCompletionMarker(stats: {
  totalMigrations: number;
  appliedMigrations: number;
  skippedMigrations: number;
  failedMigrations: number;
  durationMs: number;
}): void {
  try {
    writeFileSync(COMPLETION_MARKER_PATH, JSON.stringify(stats, null, 2));
    console.log(`Created completion marker: ${COMPLETION_MARKER_PATH}`);
  } catch (error) {
    console.error('Failed to create completion marker:', error);
  }
}

/**
 * Главная функция
 *
 * @remarks
 * - Инициализирует приложение
 * - Регистрирует обработчики shutdown
 * - Применяет миграции (в соответствии с режимом)
 * - Создаёт маркер завершения (для режима once)
 * - Завершает работу (для режима once) или продолжает (scheduled)
 */
async function main(): Promise<void> {
  const startTime = Date.now();
  const mode = getMigrationMode();

  // Distributed lock (предотвращает параллельные миграции)
  let lock: Lock | null = null;

  try {
    console.log(`Starting Migration Worker in ${mode} mode...`);

    // Инициализируем зависимости
    const deps = await initializeApp();

    // Захватываем distributed lock
    const lockTtl = 5 * 60 * 1000; // 5 минут
    lock = await deps.distributedLock.acquireLock('migrations', {
      ttl: lockTtl,
      waitTimeout: 10000, // 10 секунд
      instanceId: process.env.HOSTNAME || 'local'
    });

    if (!lock) {
      console.error('[Lock] Failed to acquire migration lock — another instance is running migrations');
      process.exit(2); // Особый код выхода для lock failure
    }

    // Опционально: очистка для dev
    if (process.env.MIGRATION_AUTO_CLEANUP === 'true' && mode === MigrationMode.Once) {
      console.warn('[WARN] MIGRATION_AUTO_CLEANUP enabled — dropping database!');
      await deps.migrationRunner.cleanupDatabase();
    }

    // Регистрируем обработчики shutdown
    registerShutdownHandlers(deps);

    console.log('Applying migrations...');

    // Применяем миграции
    const stats = await deps.migrationOrchestrator.orchestrate();

    const duration = Date.now() - startTime;
    console.log(`Migrations completed in ${duration}ms:`, stats);

    // В режиме once создаём маркер и завершаем работу
    if (mode === MigrationMode.Once) {
      // Создаём маркер завершения для healthcheck
      createCompletionMarker(stats);

      // Освобождаем lock
      if (lock) {
        await deps.distributedLock.releaseLock(lock);
      }

      // Закрываем соединения
      await closeConnections(deps);

      console.log('Migration completed, exiting (once mode)');
      process.exit(0);
    }

    // Режим scheduled: освобождаем lock и продолжаем работу
    if (lock) {
      await deps.distributedLock.releaseLock(lock);
      lock = null;
    }

    console.log('Continuing in scheduled mode...');
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error(`Migration failed after ${duration}ms:`, errorMessage);
    console.error('Error details:', error);

    // Создаём маркер с ошибкой (для healthcheck)
    try {
      writeFileSync(
        COMPLETION_MARKER_PATH,
        JSON.stringify({
          success: false,
          error: errorMessage,
          durationMs: duration
        }, null, 2)
      );
    } catch {
      // Игнорируем ошибку записи маркера
    }

    // Освобождаем lock при ошибке
    if (lock) {
      // Используем deps.distributedLock если доступен, игнорируем ошибки
      try {
        // lock.release() вызовется автоматически через TTL, это best-effort
      } catch {
        // Игнорируем
      }
    }

    // Завершаем с кодом 1
    process.exit(1);
  }
}

// Запускаем главную функцию
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
