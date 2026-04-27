"use strict";
/**
 * Migration Applier Helper
 *
 * @remarks
 * Вспомогательный класс для применения SQL миграций.
 * Разбивает SQL на отдельные команды и выполняет их.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationApplierHelper = void 0;
/**
 * Хелпер для применения миграций
 *
 * @remarks
 * Выполняет SQL команды по очереди, обрабатывает ошибки.
 * ClickHouse не поддерживает multi-statements, поэтому разбиваем вручную.
 */
class MigrationApplierHelper {
    client;
    constructor(client) {
        this.client = client;
    }
    /**
     * Применяет SQL миграцию
     *
     * @param sql - SQL скрипт миграции
     * @returns Результат применения
     */
    async apply(sql) {
        const statements = this.splitStatements(sql);
        for (const statement of statements) {
            const result = await this.executeStatement(statement);
            if (!result.success) {
                return result;
            }
        }
        return { success: true };
    }
    /**
     * Выполняет одиночную SQL команду
     *
     * @param statement - SQL команда
     * @returns Результат выполнения
     */
    async executeStatement(statement) {
        try {
            await this.client.command({ query: statement });
            return { success: true };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return { success: false, error: message };
        }
    }
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
    splitStatements(sql) {
        return sql
            // Удаляем однострочные комментарии
            .split('\n')
            .filter(line => !line.trim().startsWith('--'))
            .join('\n')
            // Разбиваем по ";"
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);
    }
}
exports.MigrationApplierHelper = MigrationApplierHelper;
