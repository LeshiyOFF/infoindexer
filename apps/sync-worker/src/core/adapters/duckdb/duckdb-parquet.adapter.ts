/**
 * Адаптер для чтения Parquet через DuckDB
 *
 * @remarks
 * Реализует IParquetReader порт с помощью DuckDB.
 */

import type { IParquetReader, DescribeResult } from '../../ports';
import type { ParquetRow } from '../../types';
import { promisify } from 'util';

/**
 * Базовый интерфейс для DuckDB Connection
 */
interface DuckDBConnection {
  stream(query: string): AsyncIterable<Record<string, unknown>>;
  close(): void;
}

/**
 * Типизированная строка из DuckDB DESCRIBE
 */
interface DuckDBDescribeRow {
  column_name: string;
  column_type: string;
}

/**
 * Типизированная строка из DuckDB COUNT
 */
interface DuckDBCountRow {
  total: bigint | number;
}

/**
 * Колбэк для DuckDB all() запроса
 */
type DuckDBAllCallback = (err: Error | null, rows: readonly unknown[]) => void;

/**
 * Типизированное соединение DuckDB с методом all
 */
interface DuckDBConnectionWithAll extends DuckDBConnection {
  all(query: string, callback: DuckDBAllCallback): void;
}

/**
 * Интерфейс для DuckDB Database (без типов из библиотеки)
 */
interface DuckDBDatabase {
  run(query: string, callback?: (err: Error | null) => void): void;
  connect(): DuckDBConnectionWithAll;
}

/**
 * Адаптер для чтения Parquet через DuckDB
 *
 * @remarks
 * FIX v4: Использует promisify для превращения callback API в Promise API.
 * Это позволяет избежать race conditions в C++ binding.
 */
export class DuckDBParquetAdapter implements IParquetReader {
  private extPath: string;

  constructor() {
    const path = require('path');
    this.extPath = path.join(__dirname, '../../../../httpfs.duckdb_extension');
  }

  /**
   * Создаёт новый Database с загруженным extension
   */
  private async createDatabase(): Promise<DuckDBDatabase> {
    const { Database } = require('duckdb');
    const db = new Database(':memory:') as DuckDBDatabase;

    const run = promisify((query: string, cb: (err: Error | null) => void) => {
      db.run(query, cb);
    });

    await run(`INSTALL '${this.extPath}';`);
    await run(`LOAD '${this.extPath}';`);

    console.log('DuckDB extension loaded.');
    return db;
  }

  /**
   * Описывает колонки Parquet файла
   */
  async describe(url: string): Promise<readonly DescribeResult[]> {
    const db = await this.createDatabase();
    const conn = db.connect();

    const all = promisify((query: string, cb: DuckDBAllCallback) => {
      conn.all(query, cb);
    });

    const rows = await all(`DESCRIBE SELECT * FROM read_parquet('${url}') LIMIT 1`);
    const typedRows = rows as readonly DuckDBDescribeRow[];

    return typedRows.map(r => ({
      column_name: r.column_name,
      column_type: r.column_type
    }));
  }

  /**
   * Стримит строки из Parquet файла
   */
  async *streamRows(url: string): AsyncIterable<ParquetRow> {
    const db = await this.createDatabase();
    const conn = db.connect() as DuckDBConnection;
    const query = `SELECT * FROM read_parquet('${url}')`;

    try {
      for await (const row of conn.stream(query)) {
        yield row as ParquetRow;
      }
    } finally {
      conn.close();
    }
  }

  /**
   * Подсчитывает количество строк
   */
  async countRows(url: string): Promise<number> {
    const db = await this.createDatabase();
    const conn = db.connect();

    const all = promisify((query: string, cb: DuckDBAllCallback) => {
      conn.all(query, cb);
    });

    const rows = await all(`SELECT COUNT(*) as total FROM read_parquet('${url}')`);
    const typedRows = rows as readonly DuckDBCountRow[];
    const total = typedRows[0]?.total ?? 0;

    return Number(total);
  }

  /**
   * No-op - каждая операция создаёт свой Database
   */
  async close(): Promise<void> {
    // GC соберёт все созданные Database instances
  }
}
