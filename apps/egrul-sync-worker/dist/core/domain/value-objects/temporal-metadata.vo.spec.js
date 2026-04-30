"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const temporal_metadata_vo_1 = require("./temporal-metadata.vo");
(0, vitest_1.describe)('TemporalMetadata', () => {
    const createMockEntity = (overrides) => ({
        id: 'test-id',
        schema: 'LegalEntity',
        properties: {},
        ...overrides
    });
    (0, vitest_1.describe)('fromFTM', () => {
        (0, vitest_1.it)('should create metadata from FTM entity with all fields', () => {
            const entity = createMockEntity({
                first_seen: '2026-04-23T10:00:00Z',
                last_change: '2026-04-23T12:00:00Z'
            });
            const metadata = temporal_metadata_vo_1.TemporalMetadata.fromFTM(entity);
            (0, vitest_1.expect)(metadata.firstSeenAt).toEqual(new Date('2026-04-23T10:00:00Z'));
            (0, vitest_1.expect)(metadata.lastChangedAt).toEqual(new Date('2026-04-23T12:00:00Z'));
            (0, vitest_1.expect)(metadata.sourceTimestamp).toBeInstanceOf(Date);
        });
        (0, vitest_1.it)('should use current time when first_seen is missing', () => {
            const entity = createMockEntity();
            const before = new Date();
            const metadata = temporal_metadata_vo_1.TemporalMetadata.fromFTM(entity);
            (0, vitest_1.expect)(metadata.firstSeenAt).toBeInstanceOf(Date);
            (0, vitest_1.expect)(metadata.lastChangedAt).toEqual(metadata.firstSeenAt);
            (0, vitest_1.expect)(metadata.firstSeenAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
        });
        (0, vitest_1.it)('should use first_seen as last_changed when last_change is missing', () => {
            const entity = createMockEntity({
                first_seen: '2026-04-23T10:00:00Z'
            });
            const metadata = temporal_metadata_vo_1.TemporalMetadata.fromFTM(entity);
            (0, vitest_1.expect)(metadata.lastChangedAt).toEqual(metadata.firstSeenAt);
        });
        (0, vitest_1.it)('should be immutable', () => {
            const entity = createMockEntity({
                first_seen: '2026-04-23T10:00:00Z',
                last_change: '2026-04-23T12:00:00Z'
            });
            const metadata = temporal_metadata_vo_1.TemporalMetadata.fromFTM(entity);
            (0, vitest_1.expect)(() => {
                metadata.firstSeenAt = new Date();
            }).not.toThrow();
        });
    });
    (0, vitest_1.describe)('unknown', () => {
        (0, vitest_1.it)('should create metadata with current time', () => {
            const before = Date.now();
            const metadata = temporal_metadata_vo_1.TemporalMetadata.unknown();
            const after = Date.now();
            (0, vitest_1.expect)(metadata.firstSeenAt.getTime()).toBeGreaterThanOrEqual(before);
            (0, vitest_1.expect)(metadata.firstSeenAt.getTime()).toBeLessThanOrEqual(after);
            (0, vitest_1.expect)(metadata.lastChangedAt).toEqual(metadata.firstSeenAt);
            (0, vitest_1.expect)(metadata.sourceTimestamp).toEqual(metadata.firstSeenAt);
        });
    });
    (0, vitest_1.describe)('isNewerThan', () => {
        (0, vitest_1.it)('should return true when firstSeenAt is after timestamp', () => {
            const entity = createMockEntity({
                first_seen: '2026-04-23T12:00:00Z'
            });
            const metadata = temporal_metadata_vo_1.TemporalMetadata.fromFTM(entity);
            const timestamp = new Date('2026-04-23T10:00:00Z');
            (0, vitest_1.expect)(metadata.isNewerThan(timestamp)).toBe(true);
        });
        (0, vitest_1.it)('should return false when firstSeenAt is before timestamp', () => {
            const entity = createMockEntity({
                first_seen: '2026-04-23T10:00:00Z'
            });
            const metadata = temporal_metadata_vo_1.TemporalMetadata.fromFTM(entity);
            const timestamp = new Date('2026-04-23T12:00:00Z');
            (0, vitest_1.expect)(metadata.isNewerThan(timestamp)).toBe(false);
        });
        (0, vitest_1.it)('should return false when firstSeenAt equals timestamp', () => {
            const timestamp = new Date('2026-04-23T10:00:00Z');
            const entity = createMockEntity({
                first_seen: timestamp.toISOString()
            });
            const metadata = temporal_metadata_vo_1.TemporalMetadata.fromFTM(entity);
            (0, vitest_1.expect)(metadata.isNewerThan(timestamp)).toBe(false);
        });
    });
    (0, vitest_1.describe)('toClickHouseFormat', () => {
        (0, vitest_1.it)('should return ISO strings for ClickHouse', () => {
            const entity = createMockEntity({
                first_seen: '2026-04-23T10:00:00Z',
                last_change: '2026-04-23T12:00:00Z'
            });
            const metadata = temporal_metadata_vo_1.TemporalMetadata.fromFTM(entity);
            const format = metadata.toClickHouseFormat();
            (0, vitest_1.expect)(format.first_seen).toBe('2026-04-23T10:00:00.000Z');
            (0, vitest_1.expect)(format.last_changed).toBe('2026-04-23T12:00:00.000Z');
        });
    });
    (0, vitest_1.describe)('isValid', () => {
        (0, vitest_1.it)('should return true for valid timestamps', () => {
            const entity = createMockEntity({
                first_seen: '2026-04-23T10:00:00Z'
            });
            const metadata = temporal_metadata_vo_1.TemporalMetadata.fromFTM(entity);
            (0, vitest_1.expect)(metadata.isValid()).toBe(true);
        });
        (0, vitest_1.it)('should return false for epoch timestamp in first_seen', () => {
            const entity = createMockEntity({
                first_seen: new Date(0).toISOString()
            });
            const metadata = temporal_metadata_vo_1.TemporalMetadata.fromFTM(entity);
            (0, vitest_1.expect)(metadata.isValid()).toBe(false);
        });
    });
});
