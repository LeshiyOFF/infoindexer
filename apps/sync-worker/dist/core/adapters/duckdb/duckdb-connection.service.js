"use strict";
/**
 * Сервис управления соединением DuckDB
 *
 * @remarks
 * Управляет жизненным циклом соединения с DuckDB.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DuckDBConnectionService = void 0;
const duckdb_1 = require("duckdb");
const path_1 = __importDefault(require("path"));
/**
 * Сервис управления соединением DuckDB
 */
class DuckDBConnectionService {
    db = null;
    conn = null;
    extPath;
    constructor() {
        this.extPath = path_1.default.join(__dirname, '../../../../httpfs.duckdb_extension');
    }
    /**
     * Получает или создаёт соединение
     */
    async getConnection() {
        if (this.db && this.conn) {
            return { db: this.db, conn: this.conn };
        }
        return this.createConnection();
    }
    /**
     * Создаёт новое соединение
     */
    async createConnection() {
        return new Promise((resolve, reject) => {
            const db = new duckdb_1.Database(':memory:');
            console.log(`Installing DuckDB extension from: ${this.extPath}`);
            db.run(`INSTALL '${this.extPath}';`, (err) => {
                if (err) {
                    console.error('Failed to install DuckDB extension:', err);
                    return reject(err);
                }
                console.log('DuckDB extension installed. Loading...');
                db.run(`LOAD '${this.extPath}';`, (err) => {
                    if (err) {
                        console.error('Failed to load DuckDB extension:', err);
                        return reject(err);
                    }
                    console.log('DuckDB extension loaded.');
                    const conn = db.connect();
                    this.db = db;
                    this.conn = conn;
                    resolve({ db, conn });
                });
            });
        });
    }
    /**
     * Закрывает соединение
     */
    async close() {
        if (this.conn) {
            this.conn.close();
            this.conn = null;
        }
        if (this.db) {
            const dbWithClose = this.db;
            if (typeof dbWithClose.close === 'function') {
                try {
                    dbWithClose.close();
                }
                catch {
                    // игнорируем ошибки закрытия
                }
            }
            this.db = null;
        }
    }
}
exports.DuckDBConnectionService = DuckDBConnectionService;
