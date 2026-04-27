/**
 * Sanction Aggregate Root Tests - equals
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

describe('Sanction.equals', () => {
  it('should be equal for same id', () => {
    const result1 = Sanction.create(VALID_SANCTION_DATA);
    const result2 = Sanction.create({
      ...VALID_SANCTION_DATA,
      program: 'Different Program Name'
    });

    const sanction1 = result1.unwrap();
    const sanction2 = result2.unwrap();

    expect(sanction1.equals(sanction2)).toBe(true);
  });

  it('should not be equal for different id', () => {
    const result1 = Sanction.create(VALID_SANCTION_DATA);
    const result2 = Sanction.create({
      ...VALID_SANCTION_DATA,
      id: 'sanction-002'
    });

    const sanction1 = result1.unwrap();
    const sanction2 = result2.unwrap();

    expect(sanction1.equals(sanction2)).toBe(false);
  });
});
