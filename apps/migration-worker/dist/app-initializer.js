"use strict";
/**
 * Migration Worker App Initializer
 *
 * @remarks
 * Отвечает за инициализацию всех зависимостей migration-worker.
 * Следует SRP: только инициализация.
 * Следует DIP: возвращает абстракции.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeApp = initializeApp;
exports.closeConnections = closeConnections;
const client_1 = require("@clickhouse/client");
const ioredis_1 = __importDefault(require("ioredis"));
const migrations_1 = require("shared/infrastructure/migrations");
/**
 * Инициализирует приложение
 *
 * @returns Dependencies приложения
 * @throws {Error} если инициализация не удалась
 *
 * @remarks
 * - Создаёт ClickHouse клиент
 * - Создаёт Redis клиент
 * - Создаёт миграционный сервис
 */
async function initializeApp() {
    const targetDatabase = process.env.CLICKHOUSE_DB || 'infoindexer';
    // Создаём ClickHouse клиент (сначала к default для создания базы)
    const clickhouseClient = (0, client_1.createClient)({
        url: process.env.CLICKHOUSE_SECURE === 'true'
            ? `https://${process.env.CLICKHOUSE_HOST || 'localhost'}:8443`
            : `http://${process.env.CLICKHOUSE_HOST || 'localhost'}:8123`,
        username: process.env.CLICKHOUSE_USER || 'default',
        password: process.env.CLICKHOUSE_PASSWORD || '',
        database: 'default',
        request_timeout: 30000,
        compression: {
            response: true,
            request: true
        }
    });
    // Создаём базу данных если не существует
    await clickhouseClient.query({
        query: `CREATE DATABASE IF NOT EXISTS ${targetDatabase}`
    });
    // Переключаемся на целевую базу
    await clickhouseClient.close();
    const dbClient = (0, client_1.createClient)({
        url: process.env.CLICKHOUSE_SECURE === 'true'
            ? `https://${process.env.CLICKHOUSE_HOST || 'localhost'}:8443`
            : `http://${process.env.CLICKHOUSE_HOST || 'localhost'}:8123`,
        username: process.env.CLICKHOUSE_USER || 'default',
        password: process.env.CLICKHOUSE_PASSWORD || '',
        database: targetDatabase,
        request_timeout: 30000,
        compression: {
            response: true,
            request: true
        }
    });
    // Создаём Redis клиент
    const redisClient = new ioredis_1.default({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
            if (times > 3)
                return null;
            return Math.min(times * 100, 3000);
        }
    });
    // Создаём distributed lock
    const distributedLock = new migrations_1.RedisDistributedLockAdapter(redisClient);
    // Создаём migration runner (для cleanup и других операций)
    const migrationRunner = (0, migrations_1.createClickHouseMigrationAdapter)(dbClient);
    // Путь к директории с миграциями
    const migrationsBaseDir = process.env.MIGRATIONS_BASE_DIR ||
        '/app/packages/shared/infrastructure/migrations/files';
    // Создаём миграционный сервис
    const migrationOrchestrator = (0, migrations_1.createUnifiedMigrationOrchestrator)({
        clickhouseClient: dbClient,
        redisClient,
        migrationsBaseDir
    });
    return {
        migrationOrchestrator,
        migrationRunner,
        clickhouseClient: dbClient,
        redisClient,
        distributedLock
    };
}
/**
 * Закрывает соединения
 *
 * @param deps - Dependencies приложения
 *
 * @remarks
 * Закрывает ClickHouse и Redis соединения.
 */
async function closeConnections(deps) {
    try {
        await deps.clickhouseClient.close();
    }
    catch (error) {
        console.error('Error closing ClickHouse connection:', error);
    }
    try {
        await deps.redisClient.quit();
    }
    catch (error) {
        console.error('Error closing Redis connection:', error);
    }
}
