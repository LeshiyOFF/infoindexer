/**
 * Financial Summary Data Transfer Objects
 *
 * @remarks
 * Domain Layer: DTO для передачи данных между слоями.
 * Part of Clean Architecture / Hexagonal Ports & Adapters.
 *
 * Architecture:
 * - *Data интерфейсы: входные данные для VO.create()
 * - *DTO интерфейсы: выходные данные для API response
 * - Не зависят от ClickHouse или других инфраструктурных деталей
 *
 * Iteration 3: CLEAN ARCHITECTURE - убраны company metadata
 * - FinancialSummary содержит только финансовые агрегаты
 * - Company metadata (director, name, status) запрашиваются отдельно
 */
/**
 * Данные для создания Money Value Object
 *
 * @remarks
 * Используется в Money.create() для валидации и создания экземпляра.
 */
export interface MoneyData {
    /** Сумма денежных средств (неотрицательная) */
    readonly amount: number;
    /** Код валюты ISO 4217 (в данный момент только RUB) */
    readonly currency: string;
}
/**
 * Money DTO для API response
 *
 * @remarks
 * Сериализованное представление Money для передачи по HTTP.
 */
export interface MoneyDTO {
    /** Сумма денежных средств */
    readonly amount: number;
    /** Код валюты ISO 4217 */
    readonly currency: string;
}
/**
 * Данные для создания FinancialSummary Value Object
 *
 * @remarks
 * Используется в FinancialSummary.create() для валидации и создания экземпляра.
 * Nullable поля из БД являются опциональными.
 * Содержит только финансовые агрегаты (без company metadata).
 */
export interface FinancialSummaryData {
    /** ИНН организации (10 digits) */
    readonly inn: string;
    /** ОГРН организации */
    readonly ogrn?: string;
    /** Регион регистрации */
    readonly region?: string;
    /** Последний год финансовых отчётов */
    readonly latestYear: number;
    /** Количество финансовых отчётов */
    readonly recordsCount: number;
    /** Выручка */
    readonly revenue: MoneyData;
    /** Чистая прибыль */
    readonly netProfit: MoneyData;
    /** Уставный капитал */
    readonly charterCapital: MoneyData;
    /** Возраст организации (в годах) */
    readonly age?: number;
    /** Код ОКВЭД */
    readonly okved?: string;
    /** Наличие геокоординатов */
    readonly hasGeo?: boolean;
    /** Широта */
    readonly lon?: string;
    /** Долгота */
    readonly lat?: string;
}
/**
 * FinancialSummary DTO для API response
 *
 * @remarks
 * Сериализованное представление FinancialSummary для передачи по HTTP.
 * Nullable поля представлены как типы union (string | null).
 */
export interface FinancialSummaryDTO {
    /** ИНН организации */
    readonly inn: string;
    /** ОГРН организации */
    readonly ogrn: string | null;
    /** Регион регистрации */
    readonly region: string | null;
    /** Последний год финансовых отчётов */
    readonly latestYear: number;
    /** Количество финансовых отчётов */
    readonly recordsCount: number;
    /** Выручка */
    readonly revenue: MoneyDTO;
    /** Чистая прибыль */
    readonly netProfit: MoneyDTO;
    /** Уставный капитал */
    readonly charterCapital: MoneyDTO;
    /** Возраст организации (в годах) */
    readonly age: number | null;
    /** Код ОКВЭД */
    readonly okved: string | null;
    /** Наличие геокоординатов */
    readonly hasGeo: number | null;
    /** Широта */
    readonly lon: string | null;
    /** Долгота */
    readonly lat: string | null;
}
