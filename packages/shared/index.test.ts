import { describe, it, expect } from 'vitest';
import { clickhouseClient, redisClient } from './index';

describe('Shared Package', () => {
  it('should export clickhouseClient', () => {
    expect(clickhouseClient).toBeDefined();
  });

  it('should export redisClient', () => {
    expect(redisClient).toBeDefined();
  });
});
