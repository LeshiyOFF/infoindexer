/**
 * Financial Summary Value Object
 *
 * Domain Layer: Агрегированная финансовая информация об организации.
 * Immutable, validated, self-contained (no Infrastructure deps).
 * Data source: financial_reports_summary View (ClickHouse).
 *
 * Iteration 3: CLEAN ARCHITECTURE
 * - Убраны company metadata (director, name, status)
 * - Добавлены geo поля (hasGeo, lon, lat)
 * - Single Responsibility: только финансовые агрегаты
 */

import { Result } from '../../result';
import type { FinancialSummaryData, FinancialSummaryDTO } from './financial-summary-data.dto';
import { Money } from './money.vo';
import {
  FinancialSummaryValidationError,
  FinancialSummaryNotFoundError
} from './financial-summary-error';
import { InvalidInnError } from '../errors';

const LEGAL_ENTITY_INN_LENGTH = 10;

/** Валидированные данные для создания FinancialSummary */
interface ValidatedFinancialData {
  inn: string;
  ogrn: string | null;
  region: string | null;
  latestYear: number;
  recordsCount: number;
  revenue: Money;
  netProfit: Money;
  charterCapital: Money;
  age: number | null;
  okved: string | null;
  hasGeo: boolean | null;
  lon: string | null;
  lat: string | null;
}

/** Financial Summary Value Object */
export class FinancialSummary {
  private constructor(
    public readonly inn: string,
    public readonly ogrn: string | null,
    public readonly region: string | null,
    public readonly latestYear: number,
    public readonly recordsCount: number,
    public readonly revenue: Money,
    public readonly netProfit: Money,
    public readonly charterCapital: Money,
    public readonly age: number | null,
    public readonly okved: string | null,
    public readonly hasGeo: boolean | null,
    public readonly lon: string | null,
    public readonly lat: string | null
  ) {}

  /** Создаёт FinancialSummary с валидацией */
  static create(data: FinancialSummaryData): Result<FinancialSummary, FinancialSummaryValidationError> {
    const innResult = FinancialSummary.validateInn(data.inn);
    if (innResult.isErr()) {
      return Result.error(new FinancialSummaryValidationError('inn', 'invalid_format', data.inn));
    }

    return FinancialSummary.validateScalarFields(data, innResult.unwrap())
      .andThen((baseData) => FinancialSummary.validateMoneyFields(baseData, data))
      .map(FinancialSummary.buildFinancialSummary);
  }

  /** Валидирует ИНН (10 digits для юр. лица) */
  private static validateInn(inn: string): Result<string, InvalidInnError> {
    const trimmed = inn?.trim() ?? '';
    if (!trimmed) {
      return Result.error(new InvalidInnError('INN is required', { inn: '' }));
    }
    if (!/^\d{10}$/.test(trimmed)) {
      return Result.error(new InvalidInnError(`INN must be ${LEGAL_ENTITY_INN_LENGTH} digits`, { inn: trimmed }));
    }
    return Result.ok(trimmed);
  }

  /** Валидирует скалярные поля */
  private static validateScalarFields(
    data: FinancialSummaryData,
    inn: string
  ): Result<Omit<ValidatedFinancialData, 'revenue' | 'netProfit' | 'charterCapital'>, FinancialSummaryValidationError> {
    if (data.latestYear <= 0) {
      return Result.error(new FinancialSummaryValidationError('latestYear', 'must_be_positive', data.latestYear));
    }
    if (data.recordsCount < 0) {
      return Result.error(new FinancialSummaryValidationError('recordsCount', 'cannot_be_negative', data.recordsCount));
    }

    return Result.ok({
      inn,
      ogrn: data.ogrn ?? null,
      region: data.region ?? null,
      latestYear: data.latestYear,
      recordsCount: data.recordsCount,
      age: data.age ?? null,
      okved: data.okved ?? null,
      hasGeo: data.hasGeo ?? null,
      lon: data.lon ?? null,
      lat: data.lat ?? null
    });
  }

  /** Валидирует Money поля */
  private static validateMoneyFields(
    baseData: Omit<ValidatedFinancialData, 'revenue' | 'netProfit' | 'charterCapital'>,
    originalData: FinancialSummaryData
  ): Result<ValidatedFinancialData, FinancialSummaryValidationError> {
    return Money
      .create(originalData.revenue)
      .mapError((err) => FinancialSummaryValidationError.fromMoneyError(err, 'revenue'))
      .andThen((revenue) =>
        Money.create(originalData.netProfit)
          .mapError((err) => FinancialSummaryValidationError.fromMoneyError(err, 'netProfit'))
          .andThen((netProfit) =>
            Money.create(originalData.charterCapital)
              .mapError((err) => FinancialSummaryValidationError.fromMoneyError(err, 'charterCapital'))
              .map((charterCapital) => ({ ...baseData, revenue, netProfit, charterCapital }))
          )
      );
  }

  /** Создаёт экземпляр из валидированных данных */
  private static buildFinancialSummary(data: ValidatedFinancialData): FinancialSummary {
    return new FinancialSummary(
      data.inn, data.ogrn, data.region, data.latestYear, data.recordsCount,
      data.revenue, data.netProfit, data.charterCapital,
      data.age, data.okved, data.hasGeo, data.lon, data.lat
    );
  }

  hasRevenue(): boolean { return this.revenue.isPositive(); }
  isLatestYear(year: number): boolean { return this.latestYear === year; }
  hasGeoData(): boolean { return this.hasGeo === true && this.lon !== null && this.lat !== null; }

  equals(other: FinancialSummary): boolean {
    return (
      this.inn === other.inn &&
      this.ogrn === other.ogrn &&
      this.region === other.region &&
      this.latestYear === other.latestYear &&
      this.recordsCount === other.recordsCount &&
      this.revenue.equals(other.revenue) &&
      this.netProfit.equals(other.netProfit) &&
      this.charterCapital.equals(other.charterCapital) &&
      this.age === other.age &&
      this.okved === other.okved &&
      this.hasGeo === other.hasGeo &&
      this.lon === other.lon &&
      this.lat === other.lat
    );
  }

  toDTO(): FinancialSummaryDTO {
    return {
      inn: this.inn, ogrn: this.ogrn, region: this.region,
      latestYear: this.latestYear, recordsCount: this.recordsCount,
      revenue: this.revenue.toDTO(),
      netProfit: this.netProfit.toDTO(),
      charterCapital: this.charterCapital.toDTO(),
      age: this.age, okved: this.okved,
      hasGeo: this.hasGeo ? 1 : null,
      lon: this.lon,
      lat: this.lat
    };
  }

  static notFound(inn: string): FinancialSummaryNotFoundError {
    return new FinancialSummaryNotFoundError(inn, 'financial_reports_summary');
  }
}
