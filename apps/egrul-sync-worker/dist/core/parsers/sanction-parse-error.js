"use strict";
/**
 * Sanction Parse Error
 *
 * Ошибка парсинга данных санкций.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SanctionParseError = exports.SanctionParseErrorCode = void 0;
const parse_error_1 = require("./parse-error");
/**
 * Типы ошибок парсинга санкций
 */
var SanctionParseErrorCode;
(function (SanctionParseErrorCode) {
    SanctionParseErrorCode["MISSING_REQUIRED_FIELD"] = "MISSING_REQUIRED_FIELD";
    SanctionParseErrorCode["INVALID_DATE_FORMAT"] = "INVALID_DATE_FORMAT";
    SanctionParseErrorCode["INVALID_INN_FORMAT"] = "INVALID_INN_FORMAT";
    SanctionParseErrorCode["INVALID_URL_FORMAT"] = "INVALID_URL_FORMAT";
    SanctionParseErrorCode["EMPTY_PROGRAM"] = "EMPTY_PROGRAM";
    SanctionParseErrorCode["EMPTY_AUTHORITY"] = "EMPTY_AUTHORITY";
})(SanctionParseErrorCode || (exports.SanctionParseErrorCode = SanctionParseErrorCode = {}));
/**
 * Ошибка парсинга санкций
 */
class SanctionParseError extends parse_error_1.ParseError {
    code;
    context;
    constructor(message, code, context) {
        super(message, 'SANCTION_PARSE_ERROR');
        this.code = code;
        this.context = context;
        Object.setPrototypeOf(this, SanctionParseError.prototype);
    }
    /**
     * Создаёт ошибку отсутствия обязательного поля
     */
    static missingField(fieldName, raw) {
        return new SanctionParseError(`Missing required field: ${fieldName}`, SanctionParseErrorCode.MISSING_REQUIRED_FIELD, { fieldName, raw: JSON.stringify(raw) });
    }
    /**
     * Создаёт ошибку неверного формата даты
     */
    static invalidDate(fieldName, value) {
        return new SanctionParseError(`Invalid date format for ${fieldName}: ${value}`, SanctionParseErrorCode.INVALID_DATE_FORMAT, { fieldName, fieldValue: value });
    }
    /**
     * Создаёт ошибку неверного формата ИНН
     */
    static invalidInn(value) {
        return new SanctionParseError(`Invalid INN format: ${value}`, SanctionParseErrorCode.INVALID_INN_FORMAT, { fieldValue: value });
    }
    /**
     * Создаёт ошибку неверного формата URL
     */
    static invalidUrl(fieldName, value) {
        return new SanctionParseError(`Invalid URL format for ${fieldName}: ${value}`, SanctionParseErrorCode.INVALID_URL_FORMAT, { fieldName, fieldValue: value });
    }
    /**
     * Создаёт ошибку пустой программы
     */
    static emptyProgram() {
        return new SanctionParseError('Sanction program cannot be empty', SanctionParseErrorCode.EMPTY_PROGRAM);
    }
    /**
     * Создаёт ошибку пустого органа
     */
    static emptyAuthority() {
        return new SanctionParseError('Sanction authority cannot be empty', SanctionParseErrorCode.EMPTY_AUTHORITY);
    }
}
exports.SanctionParseError = SanctionParseError;
