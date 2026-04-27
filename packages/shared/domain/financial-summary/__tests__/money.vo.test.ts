/**
 * Money Value Object Tests
 */

import { describe, it, expect } from 'vitest';
import { Money } from '../money.vo';
import { InvalidMoneyError } from '../financial-summary-error';

describe('Money', () => {
  describe('create', () => {
    it('should create valid Money with RUB currency', () => {
      const result = Money.create({ amount: 1000, currency: 'RUB' });
      expect(result.isOk()).toBe(true);

      const money = result.unwrap();
      expect(money.amount).toBe(1000);
      expect(money.currency).toBe('RUB');
    });

    it('should create Money with zero amount', () => {
      const result = Money.create({ amount: 0, currency: 'RUB' });
      expect(result.isOk()).toBe(true);

      const money = result.unwrap();
      expect(money.amount).toBe(0);
    });

    it('should normalize currency to uppercase', () => {
      const result = Money.create({ amount: 100, currency: 'rub' });
      expect(result.isOk()).toBe(true);

      const money = result.unwrap();
      expect(money.currency).toBe('RUB');
    });

    it('should trim currency whitespace', () => {
      const result = Money.create({ amount: 100, currency: '  RUB  ' });
      expect(result.isOk()).toBe(true);

      const money = result.unwrap();
      expect(money.currency).toBe('RUB');
    });

    it('should return error for negative amount', () => {
      const result = Money.create({ amount: -100, currency: 'RUB' });
      expect(result.isErr()).toBe(true);

      const error = result.match({
        ok: () => null,
        err: (e) => e
      });
      expect(error).toBeInstanceOf(InvalidMoneyError);
      expect(error!.context.reason).toBe('negative_amount');
      expect(error!.context.amount).toBe(-100);
    });

    it('should return error for invalid currency', () => {
      const result = Money.create({ amount: 100, currency: 'USD' });
      expect(result.isErr()).toBe(true);

      const error = result.match({
        ok: () => null,
        err: (e) => e
      });
      expect(error).toBeInstanceOf(InvalidMoneyError);
      expect(error!.context.reason).toBe('invalid_currency');
    });

    it('should return error for missing amount', () => {
      const result = Money.create({ amount: NaN, currency: 'RUB' });
      expect(result.isErr()).toBe(true);

      const error = result.match({
        ok: () => null,
        err: (e) => e
      });
      expect(error).toBeInstanceOf(InvalidMoneyError);
      expect(error!.context.reason).toBe('missing_field');
    });

    it('should default currency to RUB when undefined', () => {
      const result = Money.create({ amount: 100, currency: undefined as unknown as string });
      expect(result.isOk()).toBe(true);

      const money = result.unwrap();
      expect(money.currency).toBe('RUB');
    });
  });

  describe('isZero', () => {
    it('should return true for zero amount', () => {
      const result = Money.create({ amount: 0, currency: 'RUB' });
      const money = result.unwrap();
      expect(money.isZero()).toBe(true);
    });

    it('should return false for positive amount', () => {
      const result = Money.create({ amount: 100, currency: 'RUB' });
      const money = result.unwrap();
      expect(money.isZero()).toBe(false);
    });
  });

  describe('isPositive', () => {
    it('should return true for positive amount', () => {
      const result = Money.create({ amount: 100, currency: 'RUB' });
      const money = result.unwrap();
      expect(money.isPositive()).toBe(true);
    });

    it('should return false for zero amount', () => {
      const result = Money.create({ amount: 0, currency: 'RUB' });
      const money = result.unwrap();
      expect(money.isPositive()).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true for equal values', () => {
      const result1 = Money.create({ amount: 100, currency: 'RUB' });
      const result2 = Money.create({ amount: 100, currency: 'RUB' });
      const money1 = result1.unwrap();
      const money2 = result2.unwrap();

      expect(money1.equals(money2)).toBe(true);
    });

    it('should return false for different amounts', () => {
      const result1 = Money.create({ amount: 100, currency: 'RUB' });
      const result2 = Money.create({ amount: 200, currency: 'RUB' });
      const money1 = result1.unwrap();
      const money2 = result2.unwrap();

      expect(money1.equals(money2)).toBe(false);
    });

    it('should return false for different currencies', () => {
      const result1 = Money.create({ amount: 100, currency: 'RUB' });
      const result2 = Money.create({ amount: 100, currency: 'USD' });
      const money1 = result1.unwrap();
      // result2 — ошибка (USD не поддерживается)
      expect(result2.isErr()).toBe(true);
    });
  });

  describe('add', () => {
    it('should add two Money instances', () => {
      const result1 = Money.create({ amount: 100, currency: 'RUB' });
      const result2 = Money.create({ amount: 50, currency: 'RUB' });
      const money1 = result1.unwrap();
      const money2 = result2.unwrap();

      const sumResult = money1.add(money2);
      expect(sumResult.isOk()).toBe(true);

      const sum = sumResult.unwrap();
      expect(sum.amount).toBe(150);
      expect(sum.currency).toBe('RUB');
    });

    it('should return error for different currencies', () => {
      const result1 = Money.create({ amount: 100, currency: 'RUB' });
      const result2 = Money.create({ amount: 50, currency: 'USD' });
      const money1 = result1.unwrap();
      // result2 — ошибка (USD не поддерживается)
      expect(result2.isErr()).toBe(true);
    });
  });

  describe('multiply', () => {
    it('should multiply Money by positive factor', () => {
      const result = Money.create({ amount: 100, currency: 'RUB' });
      const money = result.unwrap();

      const multiplied = money.multiply(2);
      expect(multiplied.amount).toBe(200);
      expect(multiplied.currency).toBe('RUB');
    });

    it('should return zero for negative factor (protection)', () => {
      const result = Money.create({ amount: 100, currency: 'RUB' });
      const money = result.unwrap();

      const multiplied = money.multiply(-1);
      expect(multiplied.amount).toBe(0);
    });

    it('should handle fractional factor', () => {
      const result = Money.create({ amount: 100, currency: 'RUB' });
      const money = result.unwrap();

      const multiplied = money.multiply(0.5);
      expect(multiplied.amount).toBe(50);
    });
  });

  describe('toDTO', () => {
    it('should convert to DTO with correct structure', () => {
      const result = Money.create({ amount: 1000, currency: 'RUB' });
      const money = result.unwrap();

      const dto = money.toDTO();
      expect(dto).toEqual({ amount: 1000, currency: 'RUB' });
    });
  });

  describe('toString', () => {
    it('should format as string', () => {
      const result = Money.create({ amount: 1000, currency: 'RUB' });
      const money = result.unwrap();

      expect(money.toString()).toBe('1000 RUB');
    });
  });
});
