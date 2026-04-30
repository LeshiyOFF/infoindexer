/**
 * Transform Aggregator Service
 *
 * @remarks
 * Aggregates staging data into production format.
 * Follows SRP: only responsible for data aggregation.
 *
 * @pattern Single Responsibility Principle
 * @pattern Strategy Pattern (table-specific aggregation)
 */
import type { IProductionStorage } from '../domain/ports/i-production-storage.port';
/**
 * Transform Aggregator Service
 *
 * @remarks
 * Performs table-specific aggregation logic.
 * Uses strict typing - no any/unknown types.
 */
export declare class TransformAggregatorService {
    private readonly productionStorage;
    constructor(productionStorage: IProductionStorage);
    /**
     * Aggregate and insert companies
     *
     * @param data - Grouped staging data by INN
     */
    aggregateCompanies(data: Map<string, unknown[]>): Promise<number>;
    /**
     * Aggregate and insert directors
     *
     * @param data - Grouped staging data by organization_id
     */
    aggregateDirectors(data: Map<string, unknown[]>): Promise<number>;
    /**
     * Aggregate and insert founders
     *
     * @param data - Grouped staging data by asset_id
     */
    aggregateFounders(data: Map<string, unknown[]>): Promise<number>;
    /**
     * Get latest company row by date
     *
     * @param rows - Array of company rows
     * @returns Row with latest date
     */
    private getLatestCompanyRow;
}
