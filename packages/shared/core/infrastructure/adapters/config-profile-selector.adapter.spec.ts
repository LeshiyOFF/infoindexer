import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ConfigProfileSelectorAdapter } from './config-profile-selector.adapter';
import { ResourceInfo } from '../../domain/value-objects/resource-info.vo';
import { ConfigProfile, ConfigProfileType } from '../../domain/value-objects/config-profile.vo';

describe('ConfigProfileSelectorAdapter', () => {
  let adapter: ConfigProfileSelectorAdapter;
  const originalEnv = process.env.CONFIG_PROFILE;

  beforeEach(() => {
    adapter = new ConfigProfileSelectorAdapter();
  });

  afterEach(() => {
    process.env.CONFIG_PROFILE = originalEnv;
  });

  describe('select', () => {
    it('should select LOW for 2GB without override', () => {
      const resources = ResourceInfo.fromGB(2);
      const profile = adapter.select(resources);

      expect(profile).toBe(ConfigProfile.LOW);
    });

    it('should select STANDARD for 8GB without override', () => {
      const resources = ResourceInfo.fromGB(8);
      const profile = adapter.select(resources);

      expect(profile).toBe(ConfigProfile.STANDARD);
    });

    it('should select HIGH for 32GB without override', () => {
      const resources = ResourceInfo.fromGB(32);
      const profile = adapter.select(resources);

      expect(profile).toBe(ConfigProfile.HIGH);
    });
  });

  describe('with override', () => {
    beforeEach(() => {
      process.env.CONFIG_PROFILE = 'low';
    });

    it('should use override from env', () => {
      const adapter = new ConfigProfileSelectorAdapter();
      const resources = ResourceInfo.fromGB(32);
      const profile = adapter.select(resources);

      expect(profile).toBe(ConfigProfile.LOW);
    });

    it('should accept "low-memory" alias', () => {
      process.env.CONFIG_PROFILE = 'low-memory';
      const adapter = new ConfigProfileSelectorAdapter();
      const resources = ResourceInfo.fromGB(32);
      const profile = adapter.select(resources);

      expect(profile).toBe(ConfigProfile.LOW);
    });

    it('should accept "standard" alias', () => {
      process.env.CONFIG_PROFILE = 'standard';
      const adapter = new ConfigProfileSelectorAdapter();
      const resources = ResourceInfo.fromGB(2);
      const profile = adapter.select(resources);

      expect(profile).toBe(ConfigProfile.STANDARD);
    });

    it('should accept "default" alias', () => {
      process.env.CONFIG_PROFILE = 'default';
      const adapter = new ConfigProfileSelectorAdapter();
      const resources = ResourceInfo.fromGB(2);
      const profile = adapter.select(resources);

      expect(profile).toBe(ConfigProfile.STANDARD);
    });

    it('should accept "high-memory" alias', () => {
      process.env.CONFIG_PROFILE = 'high-memory';
      const adapter = new ConfigProfileSelectorAdapter();
      const resources = ResourceInfo.fromGB(2);
      const profile = adapter.select(resources);

      expect(profile).toBe(ConfigProfile.HIGH);
    });

    it('should warn on unknown override', () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      process.env.CONFIG_PROFILE = 'unknown';
      const adapter = new ConfigProfileSelectorAdapter();
      const resources = ResourceInfo.fromGB(8);

      const profile = adapter.select(resources);

      expect(profile).toBe(ConfigProfile.STANDARD);
      expect(consoleWarn).toHaveBeenCalledWith('Unknown CONFIG_PROFILE: unknown, using auto-selection');

      consoleWarn.mockRestore();
    });
  });

  describe('getProfileTypeName', () => {
    it('should return type name as string', () => {
      const name = adapter.getProfileTypeName(ConfigProfile.LOW);
      expect(name).toBe('low');
    });
  });

  describe('isOverridden', () => {
    it('should return false when no override', () => {
      expect(adapter.isOverridden()).toBe(false);
    });

    it('should return true when override set', () => {
      process.env.CONFIG_PROFILE = 'low';
      const adapter = new ConfigProfileSelectorAdapter();

      expect(adapter.isOverridden()).toBe(true);
    });
  });

  describe('getOverride', () => {
    it('should return undefined when no override', () => {
      expect(adapter.getOverride()).toBeUndefined();
    });

    it('should return override value', () => {
      process.env.CONFIG_PROFILE = 'high';
      const adapter = new ConfigProfileSelectorAdapter();

      expect(adapter.getOverride()).toBe('high');
    });
  });
});
