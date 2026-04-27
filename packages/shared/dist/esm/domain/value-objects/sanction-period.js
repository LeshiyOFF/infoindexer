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
import { InvalidPeriodError } from '../errors';
export class SanctionPeriod {
    startDate;
    endDate;
    constructor(startDate, endDate) {
        this.startDate = startDate;
        this.endDate = endDate;
        // Валидация в конструкторе (нельзя создать невалидный Period)
        if (endDate && endDate < startDate) {
            throw new InvalidPeriodError('End date cannot be before start date', {
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            });
        }
    }
    static create(startDate, endDate) {
        if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
            throw new InvalidPeriodError('Invalid start date', { startDate });
        }
        if (endDate !== null && (!(endDate instanceof Date) || isNaN(endDate.getTime()))) {
            throw new InvalidPeriodError('Invalid end date', { endDate });
        }
        return new SanctionPeriod(startDate, endDate);
    }
    /**
     * Проверяет активна ли санкция на текущий момент
     */
    get isActive() {
        return this.endDate === null || this.endDate > new Date();
    }
    /**
     * Длительность в миллисекундах (null если без даты окончания)
     */
    get duration() {
        if (!this.endDate)
            return null;
        return this.endDate.getTime() - this.startDate.getTime();
    }
    /**
     * Форматирует период для отображения
     */
    format(locale = 'ru-RU') {
        const fmt = (date) => date.toLocaleDateString(locale, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        return this.endDate
            ? `${fmt(this.startDate)} – ${fmt(this.endDate)}`
            : `с ${fmt(this.startDate)}`;
    }
    equals(other) {
        return (this.startDate.getTime() === other.startDate.getTime() &&
            (this.endDate?.getTime() ?? null) === (other.endDate?.getTime() ?? null));
    }
    toString() {
        return this.format();
    }
}
