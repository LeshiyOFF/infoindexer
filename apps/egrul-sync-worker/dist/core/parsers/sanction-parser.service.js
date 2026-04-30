"use strict";
/**
 * Sanction Parser Service
 *
 * Парсит данные санкций из внешних источников (OpenSanctions, etc.)
 * во внутренний формат SanctionRow.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SanctionParserService = void 0;
const shared_1 = require("shared");
const sanction_parse_error_1 = require("./sanction-parse-error");
/**
 * Сервис парсинга санкций
 */
class SanctionParserService {
    /**
     * Парсит данные источника в SanctionRow
     *
     * @param source - Исходные данные
     * @returns Result с SanctionRow или SanctionParseError
     */
    parse(source) {
        // Валидация
        const validationError = this.validate(source);
        if (validationError) {
            return shared_1.Result.error(validationError);
        }
        // Парсинг дат
        const startDate = this.tryParseDate(source.start_date);
        if (!startDate) {
            this.logError(`Invalid start_date: ${source.start_date}`);
            return shared_1.Result.error(sanction_parse_error_1.SanctionParseError.invalidDate('start_date', source.start_date));
        }
        const endDate = this.tryParseNullableDate(source.end_date);
        if (endDate === 'INVALID') {
            this.logError(`Invalid end_date: ${source.end_date}`);
            return shared_1.Result.error(sanction_parse_error_1.SanctionParseError.invalidDate('end_date', source.end_date ?? ''));
        }
        // Валидация URL
        try {
            new URL(source.source_url.trim());
        }
        catch {
            this.logError(`Invalid URL: ${source.source_url}`);
            return shared_1.Result.error(sanction_parse_error_1.SanctionParseError.invalidUrl('source_url', source.source_url));
        }
        // Создаём SanctionRow
        const row = {
            id: source.id,
            inn: source.inn.trim(),
            program: source.program.trim(),
            program_id: source.program_id.trim(),
            authority: source.authority.trim(),
            country: source.country.trim(),
            start_date: startDate,
            end_date: endDate === null ? null : endDate,
            source_url: source.source_url.trim(),
            created_at: new Date(),
            updated_at: new Date()
        };
        return shared_1.Result.ok(row);
    }
    /**
     * Парсит батч данных
     *
     * @param sources - Массив исходных данных
     * @returns Массив Result (каждый элемент независимо успешен или с ошибкой)
     */
    parseBatch(sources) {
        return sources.map(source => this.parse(source));
    }
    /**
     * Валидирует исходные данные
     */
    validate(source) {
        if (!source.id?.trim()) {
            this.logError('Missing required field: id');
            return sanction_parse_error_1.SanctionParseError.missingField('id', source);
        }
        if (!source.inn?.trim()) {
            this.logError('Missing required field: inn');
            return sanction_parse_error_1.SanctionParseError.missingField('inn', source);
        }
        if (!source.program?.trim()) {
            this.logError('Sanction program is empty');
            return sanction_parse_error_1.SanctionParseError.emptyProgram();
        }
        if (!source.authority?.trim()) {
            this.logError('Sanction authority is empty');
            return sanction_parse_error_1.SanctionParseError.emptyAuthority();
        }
        // Валидация ИНН: 10 или 12 цифр
        const innNumeric = source.inn.replace(/\D/g, '');
        if (innNumeric.length !== 10 && innNumeric.length !== 12) {
            this.logError(`Invalid INN format: ${source.inn}`);
            return sanction_parse_error_1.SanctionParseError.invalidInn(source.inn);
        }
        return null;
    }
    /**
     * Парсит обязательную дату
     */
    tryParseDate(dateStr) {
        try {
            const parsed = new Date(dateStr);
            return isNaN(parsed.getTime()) ? null : parsed;
        }
        catch {
            return null;
        }
    }
    /**
     * Парсит опциональную дату
     * @returns Date | null | 'INVALID'
     */
    tryParseNullableDate(dateStr) {
        if (!dateStr || dateStr.trim().length === 0) {
            return null;
        }
        const parsed = this.tryParseDate(dateStr);
        return parsed ?? 'INVALID';
    }
    /**
     * Логирует ошибку парсинга
     */
    logError(message) {
        console.error(`[SanctionParser] ${message}`);
    }
}
exports.SanctionParserService = SanctionParserService;
