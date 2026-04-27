/**
 * Builder для параметров ClickHouse запроса
 */
export declare class SearchParamsBuilder {
    private params;
    withLimit(value: number): this;
    withOffset(value: number): this;
    withSearch(value: string): this;
    withRegion(value: string): this;
    withMinRevenue(value: number): this;
    withMaxRevenue(value: number): this;
    withMinAge(value: number): this;
    withMaxAge(value: number): this;
    withMinCharterCapital(value: number): this;
    withStatus(value: string): this;
    withOkved(value: string): this;
    build(): Record<string, string | number | string[] | undefined>;
}
