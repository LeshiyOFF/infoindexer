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
import { FinancialSummaryValidationError, FinancialSummaryNotFoundError } from './financial-summary-error';
/** Financial Summary Value Object */
export declare class FinancialSummary {
    readonly inn: string;
    readonly ogrn: string | null;
    readonly region: string | null;
    readonly latestYear: number;
    readonly recordsCount: number;
    readonly revenue: Money;
    readonly netProfit: Money;
    readonly charterCapital: Money;
    readonly age: number | null;
    readonly okved: string | null;
    readonly hasGeo: boolean | null;
    readonly lon: string | null;
    readonly lat: string | null;
    private constructor();
    /** Создаёт FinancialSummary с валидацией */
    static create(data: FinancialSummaryData): Result<FinancialSummary, FinancialSummaryValidationError>;
    /** Валидирует ИНН (10 digits для юр. лица) */
    private static validateInn;
    /** Валидирует скалярные поля */
    private static validateScalarFields;
    /** Валидирует Money поля */
    private static validateMoneyFields;
    /** Создаёт экземпляр из валидированных данных */
    private static buildFinancialSummary;
    hasRevenue(): boolean;
    isLatestYear(year: number): boolean;
    hasGeoData(): boolean;
    equals(other: FinancialSummary): boolean;
    toDTO(): FinancialSummaryDTO;
    static notFound(inn: string): FinancialSummaryNotFoundError;
}
