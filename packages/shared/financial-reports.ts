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
export function getCreationDate(report: FinancialReport): string | undefined {
  const value = report.creation_date;
  if (value === undefined || value === null) return undefined;
  return String(value);
}

/**
 * Извлекает дату ликвидации из отчёта
 */
export function getDissolutionDate(report: FinancialReport): string | undefined {
  const value = report.dissolution_date;
  if (value === undefined || value === null) return undefined;
  return String(value);
}

/**
 * Извлекает OKVED из отчёта
 */
export function getOkved(report: FinancialReport): string | undefined {
  const value = report.okved;
  if (value === undefined || value === null) return undefined;
  return String(value);
}

/**
 * Типизированное получение строкового поля
 */
export function getStringField(
  report: FinancialReport,
  key: string
): string | undefined {
  const value = report[key];
  if (value === undefined || value === null || value === 0) return undefined;
  return String(value);
}

/**
 * Типизированное получение числового поля
 */
export function getNumberField(
  report: FinancialReport,
  key: string
): number | undefined {
  const value = report[key];
  if (value === undefined || value === null) return undefined;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? undefined : num;
}
