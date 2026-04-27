/**
 * Builder для WHERE условий поиска организаций
 */
export declare class SearchWhereBuilder {
    private conditions;
    addRegion(): void;
    addHasGeo(): void;
    addMinRevenue(): void;
    addMaxRevenue(): void;
    addMinAge(): void;
    addMaxAge(): void;
    addMinCharterCapital(): void;
    addHasDirector(): void;
    addHasName(): void;
    addStatus(): void;
    addOkvedPrefix(): void;
    addNumericSearch(): void;
    addTextSearch(): void;
    addLatestYearGte(): void;
    build(): string;
}
