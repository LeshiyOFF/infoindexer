/**
 * Migration State Detector
 *
 * @remarks
 * Определяет текущее состояние схемы БД относительно миграции.
 * Позволяет обнаружить schema drift - расхождение между историей миграций
 * и фактическим состоянием таблиц.
 */
import type { ClickHouseClient } from '@clickhouse/client';
/**
 * Состояние миграции относительно БД
 *
 * @remarks
 * Упрощённая модель: YAGNI principle. Мы не проверяем drift,
 * потому что миграции идемпотентны (CREATE IF NOT EXISTS).
 * Schema drift будет исправлен следующей миграцией при необходимости.
 */
export declare enum MigrationState {
    /** Таблица отсутствует - миграция не применялась */
    ABSENT = "absent",
    /** Таблица существует */
    EXISTS = "exists",
    /** Не удалось определить состояние (ошибка проверки) */
    UNKNOWN = "unknown"
}
/**
 * Детектор состояния миграций
 *
 * @remarks
 * Извлекает имя таблицы из SQL миграции и проверяет её существование.
 * Для сложных миграций с несколькими таблицами проверяется первая CREATE TABLE.
 */
export declare class MigrationStateDetector {
    private readonly client;
    constructor(client: ClickHouseClient);
    /**
     * Определяет состояние миграции
     *
     * @param sql - SQL скрипт миграции
     * @returns Состояние миграции
     */
    detect(sql: string): Promise<MigrationState>;
    /**
     * Извлекает имя таблицы из SQL CREATE TABLE
     *
     * @remarks
     * Парсит SQL и извлекает имя первой создаваемой таблицы.
     * Поддерживает CREATE TABLE и CREATE TABLE IF NOT EXISTS.
     */
    private extractTableName;
    /**
     * Проверяет существование таблицы
     *
     * @param tableName - Имя таблицы
     * @returns true если таблица существует
     */
    private tableExists;
}
