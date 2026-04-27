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
export {};
