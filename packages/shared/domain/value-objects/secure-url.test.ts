/**
 * SecureUrl Value Object Tests
 */

import { describe, it, expect } from 'vitest';
import { SecureUrl } from './secure-url';
import { InvalidUrlError, UnsafeUrlError } from '../errors';

describe('SecureUrl', () => {
  const allowedUrls = [
    'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:02022R0269',
    'https://home.treasury.gov/policy-issues/financial-sanctions/sanctions-programs',
    'https://sanctionssearch.ofac.treas.gov/',
    'https://www.gov.uk/government/collections/uk-sanctions-regime',
    'https://un.org/securitycouncil/sanctions',
    'https://ec.europa.eu/info/business-economy-euro/industrial-policy/economic-security/foreign-subsidies-regulation_en'
  ];

  it.each(allowedUrls)('should accept allowed URL: %s', (url) => {
    const secureUrl = SecureUrl.create(url);
    expect(secureUrl.value).toBe(url);
  });

  it('should extract hostname', () => {
    const url = SecureUrl.create('https://eur-lex.europa.eu/path');
    expect(url.hostname).toBe('eur-lex.europa.eu');
  });

  it('should be equal for same URLs', () => {
    const url1 = SecureUrl.create('https://eur-lex.europa.eu/path');
    const url2 = SecureUrl.create('https://eur-lex.europa.eu/path');
    expect(url1.equals(url2)).toBe(true);
  });

  it('should not be equal for different URLs', () => {
    const url1 = SecureUrl.create('https://eur-lex.europa.eu/path1');
    const url2 = SecureUrl.create('https://eur-lex.europa.eu/path2');
    expect(url1.equals(url2)).toBe(false);
  });

  it('should throw for empty URL', () => {
    expect(() => SecureUrl.create('')).toThrowError(InvalidUrlError);
    expect(() => SecureUrl.create('   ')).toThrowError(InvalidUrlError);
  });

  it('should throw for invalid URL format', () => {
    expect(() => SecureUrl.create('not-a-url')).toThrowError(InvalidUrlError);
    expect(() => SecureUrl.create('javascript:alert(1)')).toThrowError(InvalidUrlError);
  });

  it('should throw for non-HTTP protocol', () => {
    expect(() => SecureUrl.create('ftp://example.com')).toThrowError(InvalidUrlError);
  });

  it('should throw for hostname not in whitelist', () => {
    expect(() => SecureUrl.create('https://evil.com')).toThrowError(UnsafeUrlError);
    expect(() => SecureUrl.create('https://google.com')).toThrowError(UnsafeUrlError);
  });

  it('should trim whitespace', () => {
    const url = SecureUrl.create('  https://eur-lex.europa.eu/path  ');
    expect(url.value).toBe('https://eur-lex.europa.eu/path');
  });
});
