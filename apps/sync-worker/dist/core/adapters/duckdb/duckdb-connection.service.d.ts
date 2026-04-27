/**
 * Сервис управления соединением DuckDB
 *
 * @remarks
 * Управляет жизненным циклом соединения с DuckDB.
 */
import { Database } from 'duckdb';
/**
 * Результат соединения с DuckDB
 */
export interface DuckDBConnectionResult {
    readonly db: Database;
    readonly conn: DuckDBConnection;
}
/**
 * Типизированное соединение DuckDB
 */
export interface DuckDBConnection {
    all(query: string, callback: (err: Error | null, rows: readonly unknown[]) => void): void;
    stream(query: string): AsyncIterable<Record<string, unknown>>;
    close(): void;
}
/**
 * Сервис управления соединением DuckDB
 */
export declare class DuckDBConnectionService {
    private db;
    private conn;
    private readonly extPath;
    constructor();
    /**
     * Получает или создаёт соединение
     */
    getConnection(): Promise<DuckDBConnectionResult>;
    /**
     * Создаёт новое соединение
     */
    private createConnection;
    /**
     * Закрывает соединение
     */
    close(): Promise<void>;
}
