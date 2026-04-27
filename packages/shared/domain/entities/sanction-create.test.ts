/**
 * Sanction Aggregate Root Tests - create factory
 */

import { describe, it, expect } from 'vitest';
import { Sanction } from './sanction';
import { Result } from '../../result';

const VALID_SANCTION_DATA = {
  id: 'sanction-001',
  inn: '7727771492',
  program: 'EU Sanctions related to actions undermining Ukraine',
  programId: 'EU-RUSSIA-2022',
  authority: 'European Commission',
  country: 'EU',
  startDate: '2022-02-24',
  sourceUrl: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:02022R0269'
};

describe('Sanction.create', () => {
  it('should create valid active sanction', () => {
    const result = Sanction.create(VALID_SANCTION_DATA);

    expect(result.isOk()).toBe(true);

    const sanction = result.unwrap();
    expect(sanction.id).toBe('sanction-001');
    expect(sanction.inn).toBe('7727771492');
    expect(sanction.isActive).toBe(true);
  });

  it('should create valid lifted sanction', () => {
    const data = {
      ...VALID_SANCTION_DATA,
      endDate: '2023-12-31'
    };

    const result = Sanction.create(data);
    const sanction = result.unwrap();

    expect(sanction.isActive).toBe(false);
  });

  it('should trim whitespace from id and inn', () => {
    const data = {
      ...VALID_SANCTION_DATA,
      id: '  sanction-001  ',
      inn: '  7727771492  '
    };

    const result = Sanction.create(data);
    const sanction = result.unwrap();

    expect(sanction.id).toBe('sanction-001');
    expect(sanction.inn).toBe('7727771492');
  });

  it('should use current date for createdAt if not provided', () => {
    const result = Sanction.create(VALID_SANCTION_DATA);
    const sanction = result.unwrap();

    const now = new Date();
    const diff = Math.abs(sanction.createdAt.getTime() - now.getTime());

    expect(diff).toBeLessThan(1000); // Within 1 second
  });

  it('should return error for empty id', () => {
    const data = { ...VALID_SANCTION_DATA, id: '' };

    const result = Sanction.create(data);

    expect(result.isErr()).toBe(true);
  });

  it('should return error for empty inn', () => {
    const data = { ...VALID_SANCTION_DATA, inn: '' };

    const result = Sanction.create(data);

    expect(result.isErr()).toBe(true);
  });

  it('should return error for invalid country code', () => {
    const data = { ...VALID_SANCTION_DATA, country: 'XX' };

    const result = Sanction.create(data);

    expect(result.isErr()).toBe(true);
  });

  it('should return error for invalid URL', () => {
    const data = { ...VALID_SANCTION_DATA, sourceUrl: 'https://evil.com' };

    const result = Sanction.create(data);

    expect(result.isErr()).toBe(true);
  });

  it('should return error for end date before start date', () => {
    const data = {
      ...VALID_SANCTION_DATA,
      startDate: '2023-01-01',
      endDate: '2022-01-01'
    };

    const result = Sanction.create(data);

    expect(result.isErr()).toBe(true);
  });
});

describe('Sanction.createUnsafe', () => {
  const VALID_SANCTION_DATA = {
    id: 'sanction-001',
    inn: '7727771492',
    program: 'EU Sanctions related to actions undermining Ukraine',
    programId: 'EU-RUSSIA-2022',
    authority: 'European Commission',
    country: 'EU',
    startDate: '2022-02-24',
    sourceUrl: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:02022R0269'
  };

  it('should create sanction directly', () => {
    const sanction = Sanction.createUnsafe(VALID_SANCTION_DATA);

    expect(sanction.id).toBe('sanction-001');
    expect(sanction.isActive).toBe(true);
  });

  it('should throw for invalid data', () => {
    expect(() => {
      Sanction.createUnsafe({ ...VALID_SANCTION_DATA, country: 'XX' });
    }).toThrow();
  });
});
