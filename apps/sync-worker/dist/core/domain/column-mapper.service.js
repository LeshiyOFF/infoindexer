"use strict";
/**
 * Сервис для маппинга колонок и данных
 *
 * @remarks
 * Объединяет NameMapperUtil и ColumnTypeUtil.
 * Отвечает за преобразование данных из Parquet в ClickHouse формат.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColumnMapper = void 0;
const utils_1 = require("../utils");
const shared_1 = require("shared");
/**
 * Сервис для маппинга колонок
 */
class ColumnMapper {
    nameMapper;
    typeUtil;
    constructor(csvPath) {
        this.nameMapper = new utils_1.NameMapperUtil(csvPath);
        this.typeUtil = new utils_1.ColumnTypeUtil();
    }
    /**
     * Преобразует результаты DESCRIBE в определения колонок для ClickHouse
     */
    mapDescribeResults(results) {
        return results.map(r => {
            const mappedName = this.nameMapper.mapName(r.column_name);
            const clickhouseType = this.typeUtil.getClickHouseType(r.column_type, mappedName);
            return {
                name: mappedName,
                type: clickhouseType
            };
        });
    }
    /**
     * Преобразует строку из Parquet в формат ClickHouse
     *
     * @remarks
     * Фильтрует неизвестные поля которые не входят в схему таблицы.
     * Это предотвращает ошибки парсинга JSON при вставке.
     */
    mapRow(row) {
        const mapped = {};
        // Получаем список известных колонок из ClickHouse схемы
        const knownColumns = this.typeUtil.getKnownColumns();
        for (const [key, val] of Object.entries(row)) {
            const mappedKey = this.nameMapper.mapName(key);
            // Пропускаем неизвестные колонки (financial, outlier и т.д.)
            if (!knownColumns.has(mappedKey)) {
                continue;
            }
            // Special handling for exemption_criteria
            if (mappedKey === 'exemption_criteria') {
                const result = shared_1.exemptionCriteriaConverter.convert(val);
                mapped[mappedKey] = result.value;
                continue;
            }
            // Special handling for geocoding_quality
            if (mappedKey === 'geocoding_quality') {
                const result = shared_1.geocodingQualityConverter.convert(val);
                mapped[mappedKey] = result.value;
                continue;
            }
            mapped[mappedKey] = this.convertValue(val);
        }
        return Object.freeze(mapped);
    }
    /**
     * Преобразует значение в формат ClickHouse
     *
     * @remarks
     * Важно: ClickHouse JSONEachRow ожидает числа без кавычек для числовых полей.
     * @clickhouse/client НЕ добавляет кавычки для строк в числовых полях, что вызывает
     * ошибку парсинга. Поэтому строковые значения для числовых полей возвращаются как null.
     */
    convertValue(val) {
        if (val === null || val === undefined)
            return val;
        if (typeof val === 'bigint') {
            return val.toString();
        }
        if (val instanceof Date || Object.prototype.toString.call(val) === '[object Date]') {
            return this.formatDate(val);
        }
        if (typeof val === 'number') {
            return val;
        }
        // Для строковых значений проверяем, является ли это валидное число
        // Важное исправление: нечисловые строки НЕ МОГУТ быть вставлены в числовые поля
        // @clickhouse/client не оборачивает их в кавычки, что ломает JSON
        if (typeof val === 'string') {
            const trimmed = val.trim();
            // Пустая строка → null
            if (trimmed === '') {
                return null;
            }
            // Проверяем число (целое)
            if (/^-?\d+$/.test(trimmed)) {
                return parseInt(trimmed, 10);
            }
            // Проверяем число (с плавающей точкой)
            if (/^-?\d+\.\d+$/.test(trimmed)) {
                return parseFloat(trimmed);
            }
            // НЕ числовая строка (например "house") → null вместо строки
            // Это критичное исправление: строки в числовых полях вызывают ошибку парсинга
            return null;
        }
        // Для остальных типов (объекты и т.д.)
        return null;
    }
    /**
     * Форматирует дату в строку
     */
    formatDate(date) {
        const utcDate = date;
        const hours = utcDate.getUTCHours();
        const minutes = utcDate.getUTCMinutes();
        const seconds = utcDate.getUTCSeconds();
        const ms = utcDate.getUTCMilliseconds();
        // Если это дата без времени (00:00:00.000)
        if (hours === 0 && minutes === 0 && seconds === 0 && ms === 0) {
            return utcDate.toISOString().split('T')[0];
        }
        return utcDate.toISOString().replace('T', ' ').substring(0, 19);
    }
}
exports.ColumnMapper = ColumnMapper;
