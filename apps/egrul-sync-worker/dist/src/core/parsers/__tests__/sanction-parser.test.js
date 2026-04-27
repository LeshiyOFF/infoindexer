"use strict";
/**
 * Sanction Parser Service Tests
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const sanction_parser_service_1 = require("../sanction-parser.service");
const sanction_parse_error_1 = require("../sanction-parse-error");
(0, vitest_1.describe)('SanctionParserService', () => {
    const parser = new sanction_parser_service_1.SanctionParserService();
    const validSource = {
        id: '123',
        inn: '7727771492',
        program: 'EU Sanctions',
        program_id: 'EU-001',
        authority: 'European Union',
        country: 'EU',
        start_date: '2024-01-01',
        end_date: null,
        source_url: 'https://example.com/sanction'
    };
    const expectErrorCode = (result, code) => {
        (0, vitest_1.expect)(result.isErr()).toBe(true);
        result.match({
            ok: () => {
                throw new Error('Should not be ok');
            },
            err: (error) => {
                (0, vitest_1.expect)(error.code).toBe(code);
            }
        });
    };
    (0, vitest_1.describe)('parse — валидация данных', () => {
        (0, vitest_1.it)('парсит валидные данные', () => {
            const result = parser.parse(validSource);
            (0, vitest_1.expect)(result.isOk()).toBe(true);
            result.match({
                ok: (row) => {
                    (0, vitest_1.expect)(row.id).toBe('123');
                    (0, vitest_1.expect)(row.inn).toBe('7727771492');
                    (0, vitest_1.expect)(row.program).toBe('EU Sanctions');
                    (0, vitest_1.expect)(row.start_date).toBeInstanceOf(Date);
                    (0, vitest_1.expect)(row.end_date).toBeNull();
                },
                err: () => {
                    throw new Error('Should not be error');
                }
            });
        });
        (0, vitest_1.it)('ошибка при пустом id', () => {
            expectErrorCode(parser.parse({ ...validSource, id: '' }), sanction_parse_error_1.SanctionParseErrorCode.MISSING_REQUIRED_FIELD);
        });
        (0, vitest_1.it)('ошибка при пустом inn', () => {
            expectErrorCode(parser.parse({ ...validSource, inn: '' }), sanction_parse_error_1.SanctionParseErrorCode.MISSING_REQUIRED_FIELD);
        });
        (0, vitest_1.it)('ошибка при неверном формате ИНН', () => {
            expectErrorCode(parser.parse({ ...validSource, inn: '123' }), sanction_parse_error_1.SanctionParseErrorCode.INVALID_INN_FORMAT);
        });
        (0, vitest_1.it)('принимает ИНН из 10 цифр', () => {
            const result = parser.parse({ ...validSource, inn: '1234567890' });
            (0, vitest_1.expect)(result.isOk()).toBe(true);
            if (result.isOk())
                (0, vitest_1.expect)(result.unwrap().inn).toBe('1234567890');
        });
        (0, vitest_1.it)('принимает ИНН из 12 цифр', () => {
            const result = parser.parse({ ...validSource, inn: '123456789012' });
            (0, vitest_1.expect)(result.isOk()).toBe(true);
            if (result.isOk())
                (0, vitest_1.expect)(result.unwrap().inn).toBe('123456789012');
        });
        (0, vitest_1.it)('ошибка при пустой программе', () => {
            expectErrorCode(parser.parse({ ...validSource, program: '' }), sanction_parse_error_1.SanctionParseErrorCode.EMPTY_PROGRAM);
        });
        (0, vitest_1.it)('ошибка при пустом органе', () => {
            expectErrorCode(parser.parse({ ...validSource, authority: '' }), sanction_parse_error_1.SanctionParseErrorCode.EMPTY_AUTHORITY);
        });
        (0, vitest_1.it)('ошибка при неверном формате даты начала', () => {
            expectErrorCode(parser.parse({ ...validSource, start_date: 'invalid' }), sanction_parse_error_1.SanctionParseErrorCode.INVALID_DATE_FORMAT);
        });
        (0, vitest_1.it)('парсит дату окончания', () => {
            const result = parser.parse({ ...validSource, end_date: '2025-12-31' });
            (0, vitest_1.expect)(result.isOk()).toBe(true);
            if (result.isOk())
                (0, vitest_1.expect)(result.unwrap().end_date).toBeInstanceOf(Date);
        });
        (0, vitest_1.it)('ошибка при неверном формате даты окончания', () => {
            expectErrorCode(parser.parse({ ...validSource, end_date: 'invalid' }), sanction_parse_error_1.SanctionParseErrorCode.INVALID_DATE_FORMAT);
        });
        (0, vitest_1.it)('ошибка при неверном URL', () => {
            expectErrorCode(parser.parse({ ...validSource, source_url: 'not-url' }), sanction_parse_error_1.SanctionParseErrorCode.INVALID_URL_FORMAT);
        });
    });
    (0, vitest_1.describe)('parseBatch', () => {
        (0, vitest_1.it)('парсит батч валидных данных', () => {
            const sources = [
                { ...validSource, id: '1' },
                { ...validSource, id: '2' },
                { ...validSource, id: '3' }
            ];
            const results = parser.parseBatch(sources);
            (0, vitest_1.expect)(results).toHaveLength(3);
            (0, vitest_1.expect)(results.every(r => r.isOk())).toBe(true);
        });
        (0, vitest_1.it)('возвращает смешанные результаты', () => {
            const sources = [
                { ...validSource, id: '1' },
                { ...validSource, id: '', inn: '' },
                { ...validSource, id: '3' }
            ];
            const results = parser.parseBatch(sources);
            (0, vitest_1.expect)(results).toHaveLength(3);
            (0, vitest_1.expect)(results[0].isOk()).toBe(true);
            (0, vitest_1.expect)(results[1].isErr()).toBe(true);
            (0, vitest_1.expect)(results[2].isOk()).toBe(true);
        });
    });
    (0, vitest_1.describe)('логирование', () => {
        (0, vitest_1.it)('логирует ошибки парсинга', () => {
            const consoleSpy = vitest_1.vi.spyOn(console, 'error').mockImplementation(() => { });
            parser.parse({ ...validSource, id: '' });
            (0, vitest_1.expect)(consoleSpy).toHaveBeenCalledWith('[SanctionParser] Missing required field: id');
            consoleSpy.mockRestore();
        });
    });
});
