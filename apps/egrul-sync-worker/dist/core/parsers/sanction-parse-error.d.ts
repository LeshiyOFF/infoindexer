/**
 * Sanction Parse Error
 *
 * Ошибка парсинга данных санкций.
 */
import { ParseError } from './parse-error';
/**
 * Типы ошибок парсинга санкций
 */
export declare enum SanctionParseErrorCode {
    MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",
    INVALID_DATE_FORMAT = "INVALID_DATE_FORMAT",
    INVALID_INN_FORMAT = "INVALID_INN_FORMAT",
    INVALID_URL_FORMAT = "INVALID_URL_FORMAT",
    EMPTY_PROGRAM = "EMPTY_PROGRAM",
    EMPTY_AUTHORITY = "EMPTY_AUTHORITY"
}
/**
 * Контекст ошибки парсинга
 */
export interface SanctionParseErrorContext {
    readonly fieldName?: string;
    readonly fieldValue?: string;
    readonly raw?: unknown;
}
/**
 * Ошибка парсинга санкций
 */
export declare class SanctionParseError extends ParseError {
    readonly code: SanctionParseErrorCode;
    readonly context?: SanctionParseErrorContext;
    constructor(message: string, code: SanctionParseErrorCode, context?: SanctionParseErrorContext);
    /**
     * Создаёт ошибку отсутствия обязательного поля
     */
    static missingField(fieldName: string, raw?: unknown): SanctionParseError;
    /**
     * Создаёт ошибку неверного формата даты
     */
    static invalidDate(fieldName: string, value: string): SanctionParseError;
    /**
     * Создаёт ошибку неверного формата ИНН
     */
    static invalidInn(value: string): SanctionParseError;
    /**
     * Создаёт ошибку неверного формата URL
     */
    static invalidUrl(fieldName: string, value: string): SanctionParseError;
    /**
     * Создаёт ошибку пустой программы
     */
    static emptyProgram(): SanctionParseError;
    /**
     * Создаёт ошибку пустого органа
     */
    static emptyAuthority(): SanctionParseError;
}
