"use strict";
/**
 * Адаптер для чтения Parquet через DuckDB
 *
 * @remarks
 * Реализует IParquetReader порт с помощью DuckDB.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DuckDBParquetAdapter = void 0;
const util_1 = require("util");
/**
 * Адаптер для чтения Parquet через DuckDB
 *
 * @remarks
 * FIX v4: Использует promisify для превращения callback API в Promise API.
 * Это позволяет избежать race conditions в C++ binding.
 */
class DuckDBParquetAdapter {
    extPath;
    constructor() {
        const path = require('path');
        this.extPath = path.join(__dirname, '../../../../httpfs.duckdb_extension');
    }
    /**
     * Создаёт новый Database с загруженным extension
     */
    async createDatabase() {
        const { Database } = require('duckdb');
        const db = new Database(':memory:');
        const run = (0, util_1.promisify)((query, cb) => {
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
    async describe(url) {
        const db = await this.createDatabase();
        const conn = db.connect();
        const all = (0, util_1.promisify)((query, cb) => {
            conn.all(query, cb);
        });
        const rows = await all(`DESCRIBE SELECT * FROM read_parquet('${url}') LIMIT 1`);
        const typedRows = rows;
        return typedRows.map(r => ({
            column_name: r.column_name,
            column_type: r.column_type
        }));
    }
    /**
     * Стримит строки из Parquet файла
     */
    async *streamRows(url) {
        const db = await this.createDatabase();
        const conn = db.connect();
        const query = `SELECT * FROM read_parquet('${url}')`;
        try {
            for await (const row of conn.stream(query)) {
                yield row;
            }
        }
        finally {
            conn.close();
        }
    }
    /**
     * Подсчитывает количество строк
     */
    async countRows(url) {
        const db = await this.createDatabase();
        const conn = db.connect();
        const all = (0, util_1.promisify)((query, cb) => {
            conn.all(query, cb);
        });
        const rows = await all(`SELECT COUNT(*) as total FROM read_parquet('${url}')`);
        const typedRows = rows;
        const total = typedRows[0]?.total ?? 0;
        return Number(total);
    }
    /**
     * No-op - каждая операция создаёт свой Database
     */
    async close() {
        // GC соберёт все созданные Database instances
    }
}
exports.DuckDBParquetAdapter = DuckDBParquetAdapter;
