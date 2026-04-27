/**
 * Sanction Period Value Object
 *
 * Period действия санкции
 *
 * @example
 * ```ts
 * const active = SanctionPeriod.create(new Date('2022-02-24'), null);
 * active.isActive  // true
 *
 * const lifted = SanctionPeriod.create(
 *   new Date('2022-02-24'),
 *   new Date('2023-12-31')
 * );
 * lifted.isActive  // false
 * ```
 */
export declare class SanctionPeriod {
    readonly startDate: Date;
    readonly endDate: Date | null;
    private constructor();
    static create(startDate: Date, endDate: Date | null): SanctionPeriod;
    /**
     * Проверяет активна ли санкция на текущий момент
     */
    get isActive(): boolean;
    /**
     * Длительность в миллисекундах (null если без даты окончания)
     */
    get duration(): number | null;
    /**
     * Форматирует период для отображения
     */
    format(locale?: string): string;
    equals(other: SanctionPeriod): boolean;
    toString(): string;
}
