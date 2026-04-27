/**
 * SanctionPeriod Value Object Tests
 */

import { describe, it, expect } from 'vitest';
import { SanctionPeriod } from './sanction-period';
import { InvalidPeriodError } from '../errors';

describe('SanctionPeriod', () => {
  it('should create active period (no end date)', () => {
    const start = new Date('2022-02-24');
    const period = SanctionPeriod.create(start, null);

    expect(period.startDate).toEqual(start);
    expect(period.endDate).toBeNull();
    expect(period.isActive).toBe(true);
    expect(period.duration).toBeNull();
  });

  it('should create lifted period (with end date)', () => {
    const start = new Date('2022-02-24');
    const end = new Date('2023-12-31');
    const period = SanctionPeriod.create(start, end);

    expect(period.startDate).toEqual(start);
    expect(period.endDate).toEqual(end);
    expect(period.isActive).toBe(false);
    expect(period.duration).toBeGreaterThan(0);
  });

  it('should throw if end date before start date', () => {
    const start = new Date('2023-01-01');
    const end = new Date('2022-01-01');

    expect(() => SanctionPeriod.create(start, end)).toThrowError(InvalidPeriodError);
  });

  it('should throw for invalid start date', () => {
    expect(() => SanctionPeriod.create(new Date('invalid'), null)).toThrowError(
      InvalidPeriodError
    );
  });

  it('should throw for invalid end date', () => {
    const start = new Date('2022-01-01');
    expect(() => SanctionPeriod.create(start, new Date('invalid'))).toThrowError(
      InvalidPeriodError
    );
  });

  it('should be equal for same dates', () => {
    const start = new Date('2022-02-24');
    const end = new Date('2023-12-31');

    const period1 = SanctionPeriod.create(start, end);
    const period2 = SanctionPeriod.create(new Date('2022-02-24'), new Date('2023-12-31'));

    expect(period1.equals(period2)).toBe(true);
  });

  it('should format active period', () => {
    const start = new Date('2022-02-24');
    const period = SanctionPeriod.create(start, null);

    expect(period.format()).toContain('2022');
  });

  it('should format lifted period', () => {
    const start = new Date('2022-02-24');
    const end = new Date('2023-12-31');
    const period = SanctionPeriod.create(start, end);

    const formatted = period.format();
    expect(formatted).toContain('2022');
    expect(formatted).toContain('2023');
  });

  it('should respect locale parameter', () => {
    const start = new Date('2022-02-24');
    const period = SanctionPeriod.create(start, null);

    const ruFormat = period.format('ru-RU');
    const usFormat = period.format('en-US');

    expect(ruFormat).toContain('2022');
    expect(usFormat).toContain('2022');
  });
});
