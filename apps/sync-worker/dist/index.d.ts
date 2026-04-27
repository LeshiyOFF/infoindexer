/**
 * Entry point для sync-worker
 *
 * @remarks
 * Запускает обработчики сообщений Redis pub/sub.
 * Использует Factory для создания зависимостей.
 * Обеспечивает корректный graceful shutdown с сохранением чекпоинтов.
 *
 * Миграции применяются отдельным migration-worker сервисом.
 */
export {};
