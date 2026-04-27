import { FinancialReport } from './interfaces';
/**
 * Типобезопасные утилиты для работы с FinancialReport
 *
 * FinancialReport использует индексную сигнатуру для динамических полей из Parquet.
 * Эти функции обеспечивают типобезопасный доступ к известным полям.
 */
/**
 * Извлекает дату регистрации из отчёта
 * @returns строка даты или undefined
 */
export declare function getCreationDate(report: FinancialReport): string | undefined;
/**
 * Извлекает дату ликвидации из отчёта
 */
export declare function getDissolutionDate(report: FinancialReport): string | undefined;
/**
 * Извлекает OKVED из отчёта
 */
export declare function getOkved(report: FinancialReport): string | undefined;
/**
 * Типизированное получение строкового поля
 */
export declare function getStringField(report: FinancialReport, key: string): string | undefined;
/**
 * Типизированное получение числового поля
 */
export declare function getNumberField(report: FinancialReport, key: string): number | undefined;
