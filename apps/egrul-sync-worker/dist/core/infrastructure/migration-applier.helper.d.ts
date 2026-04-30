/**
 * Migration Applier Helper
 *
 * @remarks
 * Вспомогательный класс для применения SQL миграций.
 * Разбивает SQL на отдельные команды и выполняет их.
 */
import type { ClickHouseClient } from '@clickhouse/client';
/**
 * Результат применения SQL команды
 */
interface SqlCommandResult {
    success: boolean;
    error?: string;
}
/**
 * Хелпер для применения миграций
 *
 * @remarks
 * Выполняет SQL команды по очереди, обрабатывает ошибки.
 * ClickHouse не поддерживает multi-statements, поэтому разбиваем вручную.
 */
export declare class MigrationApplierHelper {
    private readonly client;
    constructor(client: ClickHouseClient);
    /**
     * Применяет SQL миграцию
     *
     * @param sql - SQL скрипт миграции
     * @returns Результат применения
     */
    apply(sql: string): Promise<SqlCommandResult>;
    /**
     * Выполняет одиночную SQL команду
     *
     * @param statement - SQL команда
     * @returns Результат выполнения
     */
    private executeStatement;
    /**
     * Разбивает SQL на отдельные команды
     *
     * @remarks
     * - Удаляет комментарии (-- и /*)
     * - Разбивает по ";"
     * - Игнорирует пустые строки
     *
     * @param sql - SQL скрипт
     * @returns Массив SQL команд
     */
    private splitStatements;
}
export {};
