/**
 * Адаптер для чтения Parquet через DuckDB
 *
 * @remarks
 * Реализует IParquetReader порт с помощью DuckDB.
 */
import type { IParquetReader, DescribeResult } from '../../ports';
import type { ParquetRow } from '../../types';
/**
 * Адаптер для чтения Parquet через DuckDB
 *
 * @remarks
 * FIX v4: Использует promisify для превращения callback API в Promise API.
 * Это позволяет избежать race conditions в C++ binding.
 */
export declare class DuckDBParquetAdapter implements IParquetReader {
    private extPath;
    constructor();
    /**
     * Создаёт новый Database с загруженным extension
     */
    private createDatabase;
    /**
     * Описывает колонки Parquet файла
     */
    describe(url: string): Promise<readonly DescribeResult[]>;
    /**
     * Стримит строки из Parquet файла
     */
    streamRows(url: string): AsyncIterable<ParquetRow>;
    /**
     * Подсчитывает количество строк
     */
    countRows(url: string): Promise<number>;
    /**
     * No-op - каждая операция создаёт свой Database
     */
    close(): Promise<void>;
}
