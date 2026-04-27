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
export class SanctionParserService {
  /**
   * Парсит данные источника в SanctionRow
   *
   * @param source - Исходные данные
   * @returns Result с SanctionRow или SanctionParseError
   */
  parse(source: SanctionSourceData): Result<SanctionRow, SanctionParseError> {
    // Валидация
    const validationError = this.validate(source);
    if (validationError) {
      return Result.error(validationError);
    }

    // Парсинг дат
    const startDate = this.tryParseDate(source.start_date);
    if (!startDate) {
      this.logError(`Invalid start_date: ${source.start_date}`);
      return Result.error(SanctionParseError.invalidDate('start_date', source.start_date));
    }

    const endDate = this.tryParseNullableDate(source.end_date);
    if (endDate === 'INVALID') {
      this.logError(`Invalid end_date: ${source.end_date}`);
      return Result.error(SanctionParseError.invalidDate('end_date', source.end_date ?? ''));
    }

    // Валидация URL
    try {
      new URL(source.source_url.trim());
    } catch {
      this.logError(`Invalid URL: ${source.source_url}`);
      return Result.error(SanctionParseError.invalidUrl('source_url', source.source_url));
    }

    // Создаём SanctionRow
    const row: SanctionRow = {
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

    return Result.ok(row);
  }

  /**
   * Парсит батч данных
   *
   * @param sources - Массив исходных данных
   * @returns Массив Result (каждый элемент независимо успешен или с ошибкой)
   */
  parseBatch(
    sources: readonly SanctionSourceData[]
  ): Result<SanctionRow, SanctionParseError>[] {
    return sources.map(source => this.parse(source));
  }

  /**
   * Валидирует исходные данные
   */
  private validate(source: SanctionSourceData): SanctionParseError | null {
    if (!source.id?.trim()) {
      this.logError('Missing required field: id');
      return SanctionParseError.missingField('id', source);
    }

    if (!source.inn?.trim()) {
      this.logError('Missing required field: inn');
      return SanctionParseError.missingField('inn', source);
    }

    if (!source.program?.trim()) {
      this.logError('Sanction program is empty');
      return SanctionParseError.emptyProgram();
    }

    if (!source.authority?.trim()) {
      this.logError('Sanction authority is empty');
      return SanctionParseError.emptyAuthority();
    }

    // Валидация ИНН: 10 или 12 цифр
    const innNumeric = source.inn.replace(/\D/g, '');
    if (innNumeric.length !== 10 && innNumeric.length !== 12) {
      this.logError(`Invalid INN format: ${source.inn}`);
      return SanctionParseError.invalidInn(source.inn);
    }

    return null;
  }

  /**
   * Парсит обязательную дату
   */
  private tryParseDate(dateStr: string): Date | null {
    try {
      const parsed = new Date(dateStr);
      return isNaN(parsed.getTime()) ? null : parsed;
    } catch {
      return null;
    }
  }

  /**
   * Парсит опциональную дату
   * @returns Date | null | 'INVALID'
   */
  private tryParseNullableDate(dateStr: string | null | undefined): Date | null | 'INVALID' {
    if (!dateStr || dateStr.trim().length === 0) {
      return null;
    }

    const parsed = this.tryParseDate(dateStr);
    return parsed ?? 'INVALID';
  }

  /**
   * Логирует ошибку парсинга
   */
  private logError(message: string): void {
    console.error(`[SanctionParser] ${message}`);
  }
}
