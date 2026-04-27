"use strict";
/**
 * Утилита для маппинга имён колонок
 *
 * @remarks
 * Парсит CSV файл с правилами переименования колонок.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NameMapperUtil = void 0;
const fs_1 = __importDefault(require("fs"));
/**
 * Утилита для маппинга имён колонок
 */
class NameMapperUtil {
    map;
    constructor(csvPath) {
        this.map = this.parseCsv(csvPath);
    }
    /**
     * Получает маппинг имён колонок
     */
    getMap() {
        return this.map;
    }
    /**
     * Преобразует имя колонки по карте
     */
    mapName(original) {
        return this.map[original] || original;
    }
    /**
     * Парсит CSV файл с правилами маппинга
     */
    parseCsv(csvPath) {
        const content = fs_1.default.readFileSync(csvPath, 'utf-8');
        const lines = content.trim().split('\n');
        const dict = {};
        const seen = {};
        for (let i = 1; i < lines.length; i++) {
            const [original, descriptive] = lines[i].split(',');
            if (!original || !descriptive)
                continue;
            const originalTrimmed = original.trim();
            let mapped = descriptive.trim();
            if (seen[mapped]) {
                seen[mapped]++;
                mapped = `${mapped}_${seen[mapped]}`;
            }
            else {
                seen[mapped] = 1;
            }
            dict[originalTrimmed] = mapped;
        }
        return Object.freeze(dict);
    }
}
exports.NameMapperUtil = NameMapperUtil;
