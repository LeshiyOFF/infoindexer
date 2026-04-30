/**
 * Sanction Parser Service
 *
 * Парсит данные санкций из внешних источников (OpenSanctions, etc.)
 * во внутренний формат SanctionRow.
 */
import type { SanctionRow } from 'shared/repositories';
import { Result } from 'shared';
import { SanctionParseError } from './sanction-parse-error';
/**
 * Исходные данные для парсинга санкции
 */
export interface SanctionSourceData {
    readonly id: string;
    readonly inn: string;
    readonly program: string;
    readonly program_id: string;
    readonly authority: string;
    readonly country: string;
    readonly start_date: string;
    readonly end_date?: string | null;
    readonly source_url: string;
}
/**
 * Сервис парсинга санкций
 */
export declare class SanctionParserService {
    /**
     * Парсит данные источника в SanctionRow
     *
     * @param source - Исходные данные
     * @returns Result с SanctionRow или SanctionParseError
     */
    parse(source: SanctionSourceData): Result<SanctionRow, SanctionParseError>;
    /**
     * Парсит батч данных
     *
     * @param sources - Массив исходных данных
     * @returns Массив Result (каждый элемент независимо успешен или с ошибкой)
     */
    parseBatch(sources: readonly SanctionSourceData[]): Result<SanctionRow, SanctionParseError>[];
    /**
     * Валидирует исходные данные
     */
    private validate;
    /**
     * Парсит обязательную дату
     */
    private tryParseDate;
    /**
     * Парсит опциональную дату
     * @returns Date | null | 'INVALID'
     */
    private tryParseNullableDate;
    /**
     * Логирует ошибку парсинга
     */
    private logError;
}
