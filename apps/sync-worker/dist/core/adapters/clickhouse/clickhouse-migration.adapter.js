"use strict";
/**
 * Адаптер для выполнения миграций ClickHouse
 *
 * @remarks
 * Реализует IMigrationRunner порт с помощью ClickHouse клиента.
 * Хранит историю миграций в таблице schema_migrations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickHouseMigrationAdapter = void 0;
const MIGRATIONS_TABLE = 'schema_migrations';
/**
 * Адаптер для выполнения миграций ClickHouse
 */
class ClickHouseMigrationAdapter {
    client;
    constructor(client) {
        this.client = client;
    }
    /**
     * Применяет SQL миграцию
     */
    async apply(sql, options) {
        const startTime = Date.now();
        if (options.dryRun) {
            console.log(`[DRY RUN] Migration ${options.version}: ${options.description}`);
            return {
                success: true,
                version: options.version,
                durationMs: Date.now() - startTime
            };
        }
        try {
            await this.ensureMigrationsTable();
            const isApplied = await this.isApplied(options.version);
            if (isApplied) {
                console.log(`Migration ${options.version} already applied, skipping`);
                return {
                    success: true,
                    version: options.version,
                    durationMs: Date.now() - startTime
                };
            }
            console.log(`Applying migration ${options.version}: ${options.description}`);
            // Применяем миграцию
            await this.client.command({ query: sql });
            // Регистрируем миграцию
            await this.recordMigration(options.version, options.description);
            const durationMs = Date.now() - startTime;
            console.log(`Migration ${options.version} applied in ${durationMs}ms`);
            return {
                success: true,
                version: options.version,
                durationMs
            };
        }
        catch (error) {
            const durationMs = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`Migration ${options.version} failed: ${errorMessage}`);
            return {
                success: false,
                version: options.version,
                durationMs,
                error: errorMessage
            };
        }
    }
    /**
     * Проверяет была ли уже применена миграция
     */
    async isApplied(version) {
        try {
            await this.ensureMigrationsTable();
            const result = await this.client.query({
                query: `
          SELECT count() as cnt
          FROM ${MIGRATIONS_TABLE}
          WHERE version = {version:String}
        `,
                query_params: { version },
                format: 'JSONEachRow'
            });
            const rows = await result.json();
            const count = parseInt(rows[0]?.cnt || '0', 10);
            return count > 0;
        }
        catch {
            return false;
        }
    }
    /**
     * Убеждается что таблица миграций существует
     */
    async ensureMigrationsTable() {
        const query = `
      CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
        version String,
        description String,
        applied_at DateTime DEFAULT now()
      ) ENGINE = MergeTree()
      ORDER BY version
    `;
        await this.client.command({ query });
    }
    /**
     * Регистрирует миграцию как применённую
     */
    async recordMigration(version, description) {
        await this.client.insert({
            table: MIGRATIONS_TABLE,
            values: [{ version, description }],
            format: 'JSONEachRow'
        });
    }
}
exports.ClickHouseMigrationAdapter = ClickHouseMigrationAdapter;
