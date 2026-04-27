/**
 * Financial Summary Value Object Tests
 *
 * Iteration 3: CLEAN ARCHITECTURE
 * - Убраны company metadata (director, name, status)
 * - Добавлены geo поля (hasGeo, lon, lat)
 */

import { describe, it, expect } from 'vitest';
import { FinancialSummary } from '../financial-summary.vo';
import { FinancialSummaryValidationError, FinancialSummaryNotFoundError } from '../financial-summary-error';

describe('FinancialSummary', () => {
  const validData = {
    inn: '7727771492',
    ogrn: '1027700132195',
    region: 'Москва',
    latestYear: 2023,
    recordsCount: 5,
    revenue: { amount: 1000000, currency: 'RUB' },
    netProfit: { amount: 50000, currency: 'RUB' },
    charterCapital: { amount: 10000, currency: 'RUB' },
    age: 10,
    okved: '62.01',
    hasGeo: true,
    lon: '37.6173',
    lat: '55.7558'
  };

  describe('create', () => {
    it('should create valid FinancialSummary', () => {
      const result = FinancialSummary.create(validData);
      expect(result.isOk()).toBe(true);

      const summary = result.unwrap();
      expect(summary.inn).toBe('7727771492');
      expect(summary.ogrn).toBe('1027700132195');
      expect(summary.latestYear).toBe(2023);
      expect(summary.recordsCount).toBe(5);
    });

    it('should handle nullable fields as undefined', () => {
      const data = {
        inn: '7727771492',
        latestYear: 2023,
        recordsCount: 1,
        revenue: { amount: 0, currency: 'RUB' },
        netProfit: { amount: 0, currency: 'RUB' },
        charterCapital: { amount: 0, currency: 'RUB' }
      };

      const result = FinancialSummary.create(data);
      expect(result.isOk()).toBe(true);

      const summary = result.unwrap();
      expect(summary.ogrn).toBeNull();
      expect(summary.region).toBeNull();
      expect(summary.age).toBeNull();
      expect(summary.okved).toBeNull();
      expect(summary.hasGeo).toBeNull();
      expect(summary.lon).toBeNull();
      expect(summary.lat).toBeNull();
    });

    it('should return error for invalid INN (too short)', () => {
      const data = { ...validData, inn: '12345' };
      const result = FinancialSummary.create(data);

      expect(result.isErr()).toBe(true);
      const error = result.match({
        ok: () => null,
        err: (e) => e
      });
      expect(error).toBeInstanceOf(FinancialSummaryValidationError);
      expect(error!.context.field).toBe('inn');
    });

    it('should return error for invalid INN (letters)', () => {
      const data = { ...validData, inn: 'abcdefghijklm' };
      const result = FinancialSummary.create(data);

      expect(result.isErr()).toBe(true);
      const error = result.match({
        ok: () => null,
        err: (e) => e
      });
      expect(error).toBeInstanceOf(FinancialSummaryValidationError);
      expect(error!.context.field).toBe('inn');
    });

    it('should return error for zero latestYear', () => {
      const data = { ...validData, latestYear: 0 };
      const result = FinancialSummary.create(data);

      expect(result.isErr()).toBe(true);
      const error = result.match({
        ok: () => null,
        err: (e) => e
      });
      expect(error!.context.field).toBe('latestYear');
    });

    it('should return error for negative recordsCount', () => {
      const data = { ...validData, recordsCount: -1 };
      const result = FinancialSummary.create(data);

      expect(result.isErr()).toBe(true);
      const error = result.match({
        ok: () => null,
        err: (e) => e
      });
      expect(error!.context.field).toBe('recordsCount');
    });

    it('should return error for negative revenue', () => {
      const data = { ...validData, revenue: { amount: -100, currency: 'RUB' } };
      const result = FinancialSummary.create(data);

      expect(result.isErr()).toBe(true);
      const error = result.match({
        ok: () => null,
        err: (e) => e
      });
      expect(error!.context.field).toBe('revenue');
    });

    it('should return error for invalid netProfit currency', () => {
      const data = { ...validData, netProfit: { amount: 100, currency: 'USD' } };
      const result = FinancialSummary.create(data);

      expect(result.isErr()).toBe(true);
      const error = result.match({
        ok: () => null,
        err: (e) => e
      });
      expect(error!.context.field).toBe('netProfit');
    });

    it('should trim INN whitespace', () => {
      const data = { ...validData, inn: '  7727771492  ' };
      const result = FinancialSummary.create(data);

      expect(result.isOk()).toBe(true);
      const summary = result.unwrap();
      expect(summary.inn).toBe('7727771492');
    });
  });

  describe('hasRevenue', () => {
    it('should return true when revenue > 0', () => {
      const data = { ...validData, revenue: { amount: 1000, currency: 'RUB' } };
      const result = FinancialSummary.create(data);
      const summary = result.unwrap();

      expect(summary.hasRevenue()).toBe(true);
    });

    it('should return false when revenue = 0', () => {
      const data = { ...validData, revenue: { amount: 0, currency: 'RUB' } };
      const result = FinancialSummary.create(data);
      const summary = result.unwrap();

      expect(summary.hasRevenue()).toBe(false);
    });
  });

  describe('isLatestYear', () => {
    it('should return true for matching year', () => {
      const result = FinancialSummary.create(validData);
      const summary = result.unwrap();

      expect(summary.isLatestYear(2023)).toBe(true);
    });

    it('should return false for different year', () => {
      const result = FinancialSummary.create(validData);
      const summary = result.unwrap();

      expect(summary.isLatestYear(2022)).toBe(false);
    });
  });

  describe('hasGeoData', () => {
    it('should return true when hasGeo=true and coordinates present', () => {
      const result = FinancialSummary.create(validData);
      const summary = result.unwrap();

      expect(summary.hasGeoData()).toBe(true);
    });

    it('should return false when hasGeo=false', () => {
      const data = { ...validData, hasGeo: false };
      const result = FinancialSummary.create(data);
      const summary = result.unwrap();

      expect(summary.hasGeoData()).toBe(false);
    });

    it('should return false when coordinates missing', () => {
      const data = { ...validData, lon: undefined, lat: undefined };
      const result = FinancialSummary.create(data);
      const summary = result.unwrap();

      expect(summary.hasGeoData()).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true for equal summaries', () => {
      const result1 = FinancialSummary.create(validData);
      const result2 = FinancialSummary.create(validData);
      const summary1 = result1.unwrap();
      const summary2 = result2.unwrap();

      expect(summary1.equals(summary2)).toBe(true);
    });

    it('should return false for different INN', () => {
      const result1 = FinancialSummary.create(validData);
      const data2 = { ...validData, inn: '7727771493' };
      const result2 = FinancialSummary.create(data2);
      const summary1 = result1.unwrap();
      const summary2 = result2.unwrap();

      expect(summary1.equals(summary2)).toBe(false);
    });

    it('should return false for different revenue', () => {
      const result1 = FinancialSummary.create(validData);
      const data2 = { ...validData, revenue: { amount: 2000000, currency: 'RUB' } };
      const result2 = FinancialSummary.create(data2);
      const summary1 = result1.unwrap();
      const summary2 = result2.unwrap();

      expect(summary1.equals(summary2)).toBe(false);
    });
  });

  describe('toDTO', () => {
    it('should convert to DTO with correct structure', () => {
      const result = FinancialSummary.create(validData);
      const summary = result.unwrap();

      const dto = summary.toDTO();
      expect(dto.inn).toBe('7727771492');
      expect(dto.ogrn).toBe('1027700132195');
      expect(dto.region).toBe('Москва');
      expect(dto.latestYear).toBe(2023);
      expect(dto.recordsCount).toBe(5);
      expect(dto.revenue).toEqual({ amount: 1000000, currency: 'RUB' });
      expect(dto.netProfit).toEqual({ amount: 50000, currency: 'RUB' });
      expect(dto.charterCapital).toEqual({ amount: 10000, currency: 'RUB' });
      expect(dto.hasGeo).toBe(1);
      expect(dto.lon).toBe('37.6173');
      expect(dto.lat).toBe('55.7558');
    });

    it('should handle nullable fields as null in DTO', () => {
      const data = {
        inn: '7727771492',
        latestYear: 2023,
        recordsCount: 1,
        revenue: { amount: 0, currency: 'RUB' },
        netProfit: { amount: 0, currency: 'RUB' },
        charterCapital: { amount: 0, currency: 'RUB' }
      };

      const result = FinancialSummary.create(data);
      const summary = result.unwrap();

      const dto = summary.toDTO();
      expect(dto.ogrn).toBeNull();
      expect(dto.region).toBeNull();
      expect(dto.age).toBeNull();
      expect(dto.okved).toBeNull();
      expect(dto.hasGeo).toBeNull();
      expect(dto.lon).toBeNull();
      expect(dto.lat).toBeNull();
    });
  });

  describe('notFound', () => {
    it('should create FinancialSummaryNotFoundError', () => {
      const error = FinancialSummary.notFound('7727771492');

      expect(error).toBeInstanceOf(FinancialSummaryNotFoundError);
      expect(error.context.inn).toBe('7727771492');
      expect(error.context.source).toBe('financial_reports_summary');
    });
  });
});
