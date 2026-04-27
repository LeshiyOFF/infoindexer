/**
 * Sanction Aggregate Root Tests - toDTO
 */

import { describe, it, expect } from 'vitest';
import { Sanction } from './sanction';
import type { SanctionDTO } from './sanction-types';

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

describe('Sanction.toDTO', () => {
  it('should convert to plain DTO', () => {
    const result = Sanction.create(VALID_SANCTION_DATA);
    const sanction = result.unwrap();
    const dto = sanction.toDTO();

    const expected: SanctionDTO = {
      id: 'sanction-001',
      inn: '7727771492',
      program: 'EU Sanctions related to actions undermining Ukraine',
      programId: 'EU-RUSSIA-2022',
      authority: 'European Commission',
      country: 'eu',
      startDate: '2022-02-24T00:00:00.000Z',
      endDate: null,
      sourceUrl: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:02022R0269',
      isActive: true
    };

    expect(dto).toEqual(expected);
  });

  it('should include endDate in DTO for lifted sanction', () => {
    const data = {
      ...VALID_SANCTION_DATA,
      endDate: '2023-12-31'
    };

    const result = Sanction.create(data);
    const sanction = result.unwrap();
    const dto = sanction.toDTO();

    expect(dto.endDate).toBe('2023-12-31T00:00:00.000Z');
    expect(dto.isActive).toBe(false);
  });
});
