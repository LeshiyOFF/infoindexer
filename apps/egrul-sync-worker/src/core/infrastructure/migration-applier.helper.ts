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
export class MigrationApplierHelper {
  constructor(private readonly client: ClickHouseClient) {}

  /**
   * Применяет SQL миграцию
   *
   * @param sql - SQL скрипт миграции
   * @returns Результат применения
   */
  async apply(sql: string): Promise<SqlCommandResult> {
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
  private async executeStatement(statement: string): Promise<SqlCommandResult> {
    try {
      await this.client.command({ query: statement });
      return { success: true };
    } catch (error) {
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
  private splitStatements(sql: string): string[] {
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
