/**
 * CountryCode Value Object Tests
 */

import { describe, it, expect } from 'vitest';
import { CountryCode } from './country-code';
import { InvalidCountryCodeError } from '../errors';

describe('CountryCode', () => {
  const validCodes = ['eu', 'EU', 'Us', 'GB', 'un', 'AU', 'CA', 'ch', 'jp', 'nz'];

  it.each(validCodes)('should create valid country code: %s', (code) => {
    const result = CountryCode.create(code);
    expect(result.value).toBe(code.toLowerCase());
  });

  it('should trim whitespace', () => {
    const result = CountryCode.create('  eu  ');
    expect(result.value).toBe('eu');
  });

  it('should be equal for same values', () => {
    const eu1 = CountryCode.create('EU');
    const eu2 = CountryCode.create('eu');
    expect(eu1.equals(eu2)).toBe(true);
  });

  it('should not be equal for different values', () => {
    const eu = CountryCode.create('EU');
    const us = CountryCode.create('US');
    expect(eu.equals(us)).toBe(false);
  });

  it('should throw for invalid code length', () => {
    expect(() => CountryCode.create('E')).toThrowError(InvalidCountryCodeError);
    expect(() => CountryCode.create('USA')).toThrowError(InvalidCountryCodeError);
  });

  it('should throw for unsupported code', () => {
    expect(() => CountryCode.create('XX')).toThrowError(InvalidCountryCodeError);
    expect(() => CountryCode.create('RU')).toThrowError(InvalidCountryCodeError);
  });

  it('should format to uppercase string', () => {
    const eu = CountryCode.create('eu');
    expect(eu.toString()).toBe('EU');
  });
});
