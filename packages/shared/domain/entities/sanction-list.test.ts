/**
 * SanctionList Value Object Tests
 */

import { describe, it, expect } from 'vitest';
import { SanctionList } from './sanction-list';
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

describe('SanctionList', () => {
  const createSanction = (id: string, inn: string = '7727771492') =>
    Sanction.createUnsafe({ ...VALID_SANCTION_DATA, id, inn });

  describe('create factory', () => {
    it('should create list from sanctions', () => {
      const sanctions = [
        createSanction('s1'),
        createSanction('s2'),
        createSanction('s3')
      ];

      const result = SanctionList.create(sanctions);

      expect(result.isOk()).toBe(true);
      expect(result.unwrap().size).toBe(3);
    });

    it('should return error for duplicate IDs', () => {
      const sanctions = [
        createSanction('s1'),
        createSanction('s2'),
        createSanction('s1') // Duplicate
      ];

      const result = SanctionList.create(sanctions);

      expect(result.isErr()).toBe(true);
    });

    it('should accept empty list', () => {
      const result = SanctionList.create([]);

      expect(result.isOk()).toBe(true);
      expect(result.unwrap().size).toBe(0);
    });
  });

  describe('filtering', () => {
    it('should filter active sanctions', () => {
      const sanctions = [
        createSanction('s1'),
        Sanction.createUnsafe({
          ...VALID_SANCTION_DATA,
          id: 's2',
          endDate: '2023-01-01'
        }),
        createSanction('s3')
      ];

      const list = SanctionList.createUnsafe(sanctions);

      expect(list.active).toHaveLength(2);
      expect(list.lifted).toHaveLength(1);
    });
  });

  describe('find operations', () => {
    it('should find sanction by ID', () => {
      const sanctions = [
        createSanction('s1'),
        createSanction('s2')
      ];

      const list = SanctionList.createUnsafe(sanctions);

      expect(list.findById('s1')).toBeTruthy();
      expect(list.findById('s2')).toBeTruthy();
      expect(list.findById('s999')).toBeNull();
    });

    it('should find sanctions by INN', () => {
      const sanctions = [
        createSanction('s1', 'inn1'),
        createSanction('s2', 'inn2'),
        createSanction('s3', 'inn1')
      ];

      const list = SanctionList.createUnsafe(sanctions);

      const inn1Sanctions = list.findByInn('inn1');
      expect(inn1Sanctions).toHaveLength(2);

      const inn2Sanctions = list.findByInn('inn2');
      expect(inn2Sanctions).toHaveLength(1);
    });
  });

  describe('toDTO', () => {
    it('should convert all sanctions to DTO', () => {
      const sanctions = [
        createSanction('s1'),
        createSanction('s2')
      ];

      const list = SanctionList.createUnsafe(sanctions);
      const dtos = list.toDTO();

      expect(dtos).toHaveLength(2);
      expect(dtos[0].id).toBe('s1');
      expect(dtos[1].id).toBe('s2');
    });
  });

  describe('groupByCountry', () => {
    it('should group sanctions by country', () => {
      const sanctions = [
        createSanction('s1', 'inn1'),
        createSanction('s2', 'inn2'),
        Sanction.createUnsafe({
          ...VALID_SANCTION_DATA,
          id: 's3',
          inn: 'inn3',
          country: 'US',
          authority: 'US Treasury',
          program: 'OFAC Sanctions',
          programId: 'US-RUSSIA-EO14071'
        })
      ];

      const list = SanctionList.createUnsafe(sanctions);
      const grouped = list.groupByCountry();

      expect(grouped['eu']).toHaveLength(2);
      expect(grouped['us']).toHaveLength(1);
    });
  });
});
