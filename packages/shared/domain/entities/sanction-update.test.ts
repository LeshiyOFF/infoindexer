/**
 * Sanction Aggregate Root Tests - withEndDate
 */

import { describe, it, expect } from 'vitest';
import { Sanction } from './sanction';

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

describe('Sanction.withEndDate', () => {
  it('should create new sanction with end date', () => {
    const result = Sanction.create(VALID_SANCTION_DATA);
    const sanction = result.unwrap();

    const newEndDate = new Date('2024-12-31');
    const updatedResult = sanction.withEndDate(newEndDate);

    expect(updatedResult.isOk()).toBe(true);

    const updated = updatedResult.unwrap();
    expect(updated.id).toBe(sanction.id);
    expect(updated.period.endDate).toEqual(newEndDate);
    expect(updated.isActive).toBe(false);
  });

  it('should preserve createdAt', () => {
    const result = Sanction.create({
      ...VALID_SANCTION_DATA,
      createdAt: new Date('2023-01-01')
    });
    const sanction = result.unwrap();

    const updated = sanction.withEndDate(new Date('2024-12-31')).unwrap();

    expect(updated.createdAt).toEqual(sanction.createdAt);
  });

  it('should update updatedAt', () => {
    const result = Sanction.create(VALID_SANCTION_DATA);
    const sanction = result.unwrap();

    const before = new Date();
    const start = Date.now();
    while (Date.now() - start < 10) {
      // Wait 10ms
    }

    const updated = sanction.withEndDate(new Date('2024-12-31')).unwrap();

    expect(updated.updatedAt.getTime()).toBeGreaterThan(before.getTime());
  });

  it('should return error for invalid end date', () => {
    const result = Sanction.create(VALID_SANCTION_DATA);
    const sanction = result.unwrap();

    const invalidEnd = new Date('2020-01-01'); // Before start
    const updatedResult = sanction.withEndDate(invalidEnd);

    expect(updatedResult.isErr()).toBe(true);
  });
});
