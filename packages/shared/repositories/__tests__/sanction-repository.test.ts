/**
 * Tests for Sanction Repository Interface
 *
 * Проверяет контракт интерфейса без реализации.
 */

import { describe, it, expect } from 'vitest';
import type {
  ISanctionRepository,
  SanctionRow,
  SanctionStats
} from '../sanction.repository';
import type { SanctionDTO } from '../../domain/entities';

describe('ISanctionRepository Interface Contract', () => {
  describe('SanctionRow interface', () => {
    it('defines required fields with correct types', () => {
      const row: SanctionRow = {
        id: '123',
        inn: '7727771492',
        program: 'EU Sanctions',
        program_id: 'EU-001',
        authority: 'European Union',
        country: 'EU',
        start_date: new Date('2024-01-01'),
        end_date: null,
        source_url: 'https://example.com/sanction',
        created_at: new Date(),
        updated_at: new Date()
      };

      expect(row.id).toBe('123');
      expect(row.inn).toBe('7727771492');
      expect(row.start_date).toBeInstanceOf(Date);
      expect(row.end_date).toBeNull();
    });
  });

  describe('SanctionStats interface', () => {
    it('defines aggregate statistics structure', () => {
      const stats: SanctionStats = {
        total: 1000,
        active: 750,
        byCountry: { RU: 500, US: 300, EU: 200 },
        byProgram: { 'SDN': 400, 'EU': 350, 'UK': 250 }
      };

      expect(stats.total).toBe(1000);
      expect(stats.active).toBe(750);
      expect(stats.byCountry.RU).toBe(500);
      expect(stats.byProgram.SDN).toBe(400);
    });

    it('allows empty records', () => {
      const emptyStats: SanctionStats = {
        total: 0,
        active: 0,
        byCountry: {},
        byProgram: {}
      };

      expect(Object.keys(emptyStats.byCountry)).toHaveLength(0);
    });
  });

  describe('Interface implementation', () => {
    it('can be fully implemented by mock class', () => {
      class MockSanctionRepository implements ISanctionRepository {
        async saveBatch(rows: readonly SanctionRow[]): Promise<void> {
          rows.length;
        }

        async findByInn(inn: string): Promise<readonly SanctionDTO[]> {
          return [];
        }

        async findByInns(inns: readonly string[]): Promise<Readonly<Record<string, readonly SanctionDTO[]>>> {
          return {};
        }

        async deleteByInn(inn: string): Promise<void> {
          inn.length;
        }

        async getStats(): Promise<SanctionStats> {
          return { total: 0, active: 0, byCountry: {}, byProgram: {} };
        }

        async exists(inn: string): Promise<boolean> {
          return false;
        }

        async getAllInns(limit?: number): Promise<readonly string[]> {
          return [];
        }
      }

      const repo = new MockSanctionRepository();
      expect(repo.saveBatch).toBeInstanceOf(Function);
      expect(repo.findByInn).toBeInstanceOf(Function);
      expect(repo.findByInns).toBeInstanceOf(Function);
      expect(repo.deleteByInn).toBeInstanceOf(Function);
      expect(repo.getStats).toBeInstanceOf(Function);
      expect(repo.exists).toBeInstanceOf(Function);
      expect(repo.getAllInns).toBeInstanceOf(Function);
    });

    it('handles batch operations correctly', async () => {
      class TestRepo implements ISanctionRepository {
        savedRows: readonly SanctionRow[] = [];

        async saveBatch(rows: readonly SanctionRow[]): Promise<void> {
          this.savedRows = rows;
        }

        async findByInn(): Promise<readonly SanctionDTO[]> {
          return [];
        }

        async findByInns(): Promise<Readonly<Record<string, readonly SanctionDTO[]>>> {
          return {};
        }

        async deleteByInn(): Promise<void> {}

        async getStats(): Promise<SanctionStats> {
          return { total: 1, active: 1, byCountry: {}, byProgram: {} };
        }

        async exists(): Promise<boolean> {
          return true;
        }

        async getAllInns(): Promise<readonly string[]> {
          return ['7727771492'];
        }
      }

      const repo = new TestRepo();
      const rows: SanctionRow[] = [
        {
          id: '1',
          inn: '7727771492',
          program: 'Test',
          program_id: 'T-1',
          authority: 'Test',
          country: 'US',
          start_date: new Date(),
          end_date: null,
          source_url: 'https://test.com',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      await repo.saveBatch(rows);
      expect(repo.savedRows).toHaveLength(1);
    });
  });
});
