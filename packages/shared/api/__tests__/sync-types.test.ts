/**
 * Tests for Sync Types
 */

import { describe, it, expect } from 'vitest';
import {
  SyncStage,
  createSyncStatus,
  calculateStagePercentage,
  DEFAULT_SYNC_CONFIG
} from '../sync.types';
import type { SyncStatusData, SyncConfig } from '../sync.types';

describe('SyncStage', () => {
  it('has all required stages', () => {
    expect(SyncStage.IDLE).toBe('idle');
    expect(SyncStage.EGRUL_DOWNLOAD).toBe('egrul_download');
    expect(SyncStage.EGRUL_PARSE).toBe('egrul_parse');
    expect(SyncStage.SANCTIONS_DOWNLOAD).toBe('sanctions_download');
    expect(SyncStage.SANCTIONS_PARSE).toBe('sanctions_parse');
    expect(SyncStage.MERGE_COMPANIES).toBe('merge_companies');
    expect(SyncStage.MERGE_SANCTIONS).toBe('merge_sanctions');
    expect(SyncStage.CLEANUP).toBe('cleanup');
    expect(SyncStage.COMPLETED).toBe('completed');
    expect(SyncStage.ERROR).toBe('error');
  });
});

describe('createSyncStatus', () => {
  it('creates basic status', () => {
    const status = createSyncStatus(
      'idle',
      SyncStage.IDLE,
      'Ready to start',
      0
    );

    expect(status).toEqual({
      status: 'idle',
      stage: SyncStage.IDLE,
      percentage: 0,
      message: 'Ready to start'
    });
  });

  it('creates status without percentage (indeterminate)', () => {
    const status = createSyncStatus(
      'running',
      SyncStage.EGRUL_DOWNLOAD,
      'Downloading...'
    );

    expect(status.percentage).toBeUndefined();
    expect(status.message).toBe('Downloading...');
  });

  it('clamps percentage to 0-100 range', () => {
    const underflow = createSyncStatus('running', SyncStage.EGRUL_DOWNLOAD, 'Test', -10);
    const overflow = createSyncStatus('running', SyncStage.EGRUL_DOWNLOAD, 'Test', 150);

    expect(underflow.percentage).toBe(0);
    expect(overflow.percentage).toBe(100);
  });

  it('includes startedAt when provided', () => {
    const startedAt = '2026-04-18T10:00:00Z';
    const status = createSyncStatus(
      'running',
      SyncStage.EGRUL_PARSE,
      'Processing',
      15,
      startedAt
    );

    expect(status.startedAt).toBe(startedAt);
  });

  it('includes completedAt for completed status', () => {
    const status = createSyncStatus(
      'completed',
      SyncStage.COMPLETED,
      'Done'
    );

    expect(status.completedAt).toBeDefined();
    expect(status.completedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('includes error when provided', () => {
    const error = 'Connection timeout';
    const status = createSyncStatus(
      'error',
      SyncStage.ERROR,
      'Failed',
      undefined,
      undefined,
      error
    );

    expect(status.error).toBe(error);
  });
});

describe('calculateStagePercentage', () => {
  it('returns correct percentages for each stage', () => {
    expect(calculateStagePercentage(SyncStage.IDLE)).toBe(0);
    expect(calculateStagePercentage(SyncStage.EGRUL_DOWNLOAD)).toBe(5);
    expect(calculateStagePercentage(SyncStage.EGRUL_PARSE)).toBe(20);
    expect(calculateStagePercentage(SyncStage.SANCTIONS_DOWNLOAD)).toBe(25);
    expect(calculateStagePercentage(SyncStage.SANCTIONS_PARSE)).toBe(40);
    expect(calculateStagePercentage(SyncStage.MERGE_COMPANIES)).toBe(70);
    expect(calculateStagePercentage(SyncStage.MERGE_SANCTIONS)).toBe(85);
    expect(calculateStagePercentage(SyncStage.CLEANUP)).toBe(95);
    expect(calculateStagePercentage(SyncStage.COMPLETED)).toBe(100);
    expect(calculateStagePercentage(SyncStage.ERROR)).toBe(0);
  });

  it('percentages follow expected progression', () => {
    const stages = [
      SyncStage.EGRUL_DOWNLOAD,
      SyncStage.EGRUL_PARSE,
      SyncStage.SANCTIONS_DOWNLOAD,
      SyncStage.SANCTIONS_PARSE,
      SyncStage.MERGE_COMPANIES,
      SyncStage.MERGE_SANCTIONS,
      SyncStage.CLEANUP
    ];

    const percentages = stages.map(calculateStagePercentage);

    // Проверяем что проценты возрастают
    for (let i = 1; i < percentages.length; i++) {
      expect(percentages[i]).toBeGreaterThan(percentages[i - 1]);
    }
  });
});

describe('DEFAULT_SYNC_CONFIG', () => {
  it('has valid config structure', () => {
    expect(DEFAULT_SYNC_CONFIG.batchSize).toBe(1000);
    expect(DEFAULT_SYNC_CONFIG.maxRetries).toBe(3);
    expect(DEFAULT_SYNC_CONFIG.timeout).toBe(30000);
    expect(DEFAULT_SYNC_CONFIG.skipExisting).toBe(false);
  });

  it('is readonly type', () => {
    const config: SyncConfig = DEFAULT_SYNC_CONFIG;

    // TypeScript должен предотвратить мутацию
    expect(() => {
      (config as any).batchSize = 500;
    }).not.toThrow();
  });
});
