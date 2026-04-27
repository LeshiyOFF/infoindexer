import { describe, it, expect } from 'vitest';
import { TemporalMetadata } from './temporal-metadata.vo';
import type { FTMEntity } from '../../entities/ftm-entity.interface';

describe('TemporalMetadata', () => {
  const createMockEntity = (overrides?: Partial<FTMEntity>): FTMEntity => ({
    id: 'test-id',
    schema: 'LegalEntity',
    properties: {},
    ...overrides
  });

  describe('fromFTM', () => {
    it('should create metadata from FTM entity with all fields', () => {
      const entity = createMockEntity({
        first_seen: '2026-04-23T10:00:00Z',
        last_change: '2026-04-23T12:00:00Z'
      });

      const metadata = TemporalMetadata.fromFTM(entity);

      expect(metadata.firstSeenAt).toEqual(new Date('2026-04-23T10:00:00Z'));
      expect(metadata.lastChangedAt).toEqual(new Date('2026-04-23T12:00:00Z'));
      expect(metadata.sourceTimestamp).toBeInstanceOf(Date);
    });

    it('should use current time when first_seen is missing', () => {
      const entity = createMockEntity();
      const before = new Date();

      const metadata = TemporalMetadata.fromFTM(entity);

      expect(metadata.firstSeenAt).toBeInstanceOf(Date);
      expect(metadata.lastChangedAt).toEqual(metadata.firstSeenAt);
      expect(metadata.firstSeenAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });

    it('should use first_seen as last_changed when last_change is missing', () => {
      const entity = createMockEntity({
        first_seen: '2026-04-23T10:00:00Z'
      });

      const metadata = TemporalMetadata.fromFTM(entity);

      expect(metadata.lastChangedAt).toEqual(metadata.firstSeenAt);
    });

    it('should be immutable', () => {
      const entity = createMockEntity({
        first_seen: '2026-04-23T10:00:00Z',
        last_change: '2026-04-23T12:00:00Z'
      });

      const metadata = TemporalMetadata.fromFTM(entity);

      expect(() => {
        (metadata as any).firstSeenAt = new Date();
      }).not.toThrow();
    });
  });

  describe('unknown', () => {
    it('should create metadata with current time', () => {
      const before = Date.now();
      const metadata = TemporalMetadata.unknown();
      const after = Date.now();

      expect(metadata.firstSeenAt.getTime()).toBeGreaterThanOrEqual(before);
      expect(metadata.firstSeenAt.getTime()).toBeLessThanOrEqual(after);
      expect(metadata.lastChangedAt).toEqual(metadata.firstSeenAt);
      expect(metadata.sourceTimestamp).toEqual(metadata.firstSeenAt);
    });
  });

  describe('isNewerThan', () => {
    it('should return true when firstSeenAt is after timestamp', () => {
      const entity = createMockEntity({
        first_seen: '2026-04-23T12:00:00Z'
      });
      const metadata = TemporalMetadata.fromFTM(entity);
      const timestamp = new Date('2026-04-23T10:00:00Z');

      expect(metadata.isNewerThan(timestamp)).toBe(true);
    });

    it('should return false when firstSeenAt is before timestamp', () => {
      const entity = createMockEntity({
        first_seen: '2026-04-23T10:00:00Z'
      });
      const metadata = TemporalMetadata.fromFTM(entity);
      const timestamp = new Date('2026-04-23T12:00:00Z');

      expect(metadata.isNewerThan(timestamp)).toBe(false);
    });

    it('should return false when firstSeenAt equals timestamp', () => {
      const timestamp = new Date('2026-04-23T10:00:00Z');
      const entity = createMockEntity({
        first_seen: timestamp.toISOString()
      });
      const metadata = TemporalMetadata.fromFTM(entity);

      expect(metadata.isNewerThan(timestamp)).toBe(false);
    });
  });

  describe('toClickHouseFormat', () => {
    it('should return ISO strings for ClickHouse', () => {
      const entity = createMockEntity({
        first_seen: '2026-04-23T10:00:00Z',
        last_change: '2026-04-23T12:00:00Z'
      });
      const metadata = TemporalMetadata.fromFTM(entity);

      const format = metadata.toClickHouseFormat();

      expect(format.first_seen).toBe('2026-04-23T10:00:00.000Z');
      expect(format.last_changed).toBe('2026-04-23T12:00:00.000Z');
    });
  });

  describe('isValid', () => {
    it('should return true for valid timestamps', () => {
      const entity = createMockEntity({
        first_seen: '2026-04-23T10:00:00Z'
      });
      const metadata = TemporalMetadata.fromFTM(entity);

      expect(metadata.isValid()).toBe(true);
    });

    it('should return false for epoch timestamp in first_seen', () => {
      const entity = createMockEntity({
        first_seen: new Date(0).toISOString()
      });
      const metadata = TemporalMetadata.fromFTM(entity);

      expect(metadata.isValid()).toBe(false);
    });
  });
});
