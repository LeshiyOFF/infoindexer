/**
 * ClickHouse Config Validator Adapter
 *
 * @remarks
 * Infrastructure Layer: SQL-based configuration validation.
 * Part of Hexagonal / Ports & Adapters architecture.
 *
 * Architecture:
 * - Port (Domain Layer): IClickHouseConfigValidator
 * - Adapter (Infrastructure Layer): This class
 *
 * Implementation:
 * - Queries system tables for configuration state
 * - Validates settings, users, profiles, quotas
 * - Returns structured validation results
 *
 * Iteration 10.2: Config Validation
 */

import type {
  IClickHouseConfigValidator,
  ConfigValidationResult,
  ConfigValidationCheck,
  ConfigValidationOptions
} from './ports/i-config-validator.port';
import type { ILogger } from './ports/i-logger.port';
import type { ClickHouseClient } from '@clickhouse/client';

/**
 * Default required users for InfoIndexer
 */
const DEFAULT_REQUIRED_USERS = [
  'infoindexer_admin',
  'infoindexer_worker',
  'infoindexer_api'
] as const;

/**
 * Default required profiles
 */
const DEFAULT_REQUIRED_PROFILES = [
  'readonly',
  'workers'
] as const;

/**
 * Default required quotas
 */
const DEFAULT_REQUIRED_QUOTAS = [
  'default'
] as const;

/**
 * ClickHouse Config Validator Implementation
 *
 * @remarks
 * Validates configuration by querying system tables.
 * Requires read access to system.* tables.
 *
 * @example
 * ```ts
 * const validator = new ClickHouseConfigValidatorAdapter(client, logger);
 * const result = await validator.validate();
 * if (!result.valid) {
 *   logger.error('Config validation failed', { errors: result.errors });
 * }
 * ```
 */
export class ClickHouseConfigValidatorAdapter implements IClickHouseConfigValidator {
  constructor(
    private readonly client: ClickHouseClient,
    private readonly logger: ILogger
  ) {}

  async validate(options?: ConfigValidationOptions): Promise<ConfigValidationResult> {
    this.logger.info('Starting ClickHouse configuration validation');

    const checks: ConfigValidationCheck[] = [];
    const errors: string[] = [];

    const opts = this.normalizeOptions(options);

    // Check 1: Users exist
    if (!opts.skipUsers) {
      const usersCheck = await this.checkUsersExist(opts.requiredUsers);
      checks.push(usersCheck);
    }

    // Check 2: Profiles exist
    if (!opts.skipProfiles) {
      const profilesCheck = await this.checkProfilesExist(opts.requiredProfiles);
      checks.push(profilesCheck);
    }

    // Check 4: Quotas exist
    if (!opts.skipQuotas) {
      const quotaCheck = await this.checkQuotasExist(opts.requiredQuotas);
      checks.push(quotaCheck);
    }

    // Check 5: Audit log enabled
    if (!opts.skipAudit) {
      const auditCheck = await this.checkQueryLogEnabled();
      checks.push(auditCheck);
    }

    // Collect errors from failed checks
    for (const check of checks) {
      if (!check.passed) {
        errors.push(`${check.name}: expected=${check.expected}, actual=${check.actual}`);
      }
    }

    const valid = errors.length === 0;

    if (valid) {
      this.logger.info('Configuration validation passed', { checks: checks.length });
    } else {
      this.logger.error('Configuration validation failed', {
        errors,
        failedCount: errors.length
      });
    }

    return {
      valid,
      checks,
      errors
    };
  }

  async validateSetting(name: string, expected: unknown): Promise<ConfigValidationCheck> {
    try {
      const result = await this.client.query({
        query: `
          SELECT value
          FROM system.settings
          WHERE name = {name:String}
        `,
        query_params: { name },
        format: 'JSONEachRow'
      });

      const rows = await result.json() as Array<{ value: string }>;

      if (rows.length === 0) {
        return {
          name: `Setting ${name}`,
          expected,
          actual: 'Not found',
          passed: false
        };
      }

      const actual = this.parseSettingValue(rows[0].value, expected);

      return {
        name: `Setting ${name}`,
        expected,
        actual,
        passed: this.compareValues(actual, expected)
      };
    } catch (error) {
      return {
        name: `Setting ${name}`,
        expected,
        actual: `Error: ${error instanceof Error ? error.message : String(error)}`,
        passed: false
      };
    }
  }

  /**
   * Check if users exist
   */
  private async checkUsersExist(users: readonly string[]): Promise<ConfigValidationCheck> {
    try {
      const result = await this.client.query({
        query: `
          SELECT count() as cnt
          FROM system.users
          WHERE name IN ({users:Array(String)})
        `,
        query_params: { users },
        format: 'JSONEachRow'
      });

      const rows = await result.json() as Array<{ cnt: string }>;
      const actual = parseInt(rows[0]?.cnt || '0', 10);
      const expected = users.length;

      return {
        name: 'Required users exist',
        expected,
        actual,
        passed: actual === expected
      };
    } catch (error) {
      return {
        name: 'Required users exist',
        expected: users.length,
        actual: `Error: ${error instanceof Error ? error.message : String(error)}`,
        passed: false
      };
    }
  }

  /**
   * Check if profiles exist
   *
   * @remarks
   * Profiles are defined in XML config files (profiles.xml).
   * We verify they are loadable by checking system.settings_profiles.
   */
  private async checkProfilesExist(profiles: readonly string[]): Promise<ConfigValidationCheck> {
    try {
      const result = await this.client.query({
        query: `
          SELECT count() as cnt
          FROM system.settings_profiles
          WHERE name IN ({profiles:Array(String)})
        `,
        query_params: { profiles },
        format: 'JSONEachRow'
      });

      const rows = await result.json() as Array<{ cnt: string }>;
      const actual = parseInt(rows[0]?.cnt || '0', 10);
      const expected = profiles.length;

      return {
        name: 'Required profiles exist',
        expected,
        actual,
        passed: actual === expected
      };
    } catch (error) {
      return {
        name: 'Required profiles exist',
        expected: profiles.length,
        actual: `Error: ${error instanceof Error ? error.message : String(error)}`,
        passed: false
      };
    }
  }

  /**
   * Check if quotas exist
   */
  private async checkQuotasExist(quotas: readonly string[]): Promise<ConfigValidationCheck> {
    try {
      const result = await this.client.query({
        query: `
          SELECT count() as cnt
          FROM system.quotas
          WHERE name IN ({quotas:Array(String)})
        `,
        query_params: { quotas },
        format: 'JSONEachRow'
      });

      const rows = await result.json() as Array<{ cnt: string }>;
      const actual = parseInt(rows[0]?.cnt || '0', 10);
      const expected = quotas.length;

      return {
        name: 'Required quotas exist',
        expected,
        actual,
        passed: actual === expected
      };
    } catch (error) {
      return {
        name: 'Required quotas exist',
        expected: quotas.length,
        actual: `Error: ${error instanceof Error ? error.message : String(error)}`,
        passed: false
      };
    }
  }

  /**
   * Check if query log is enabled
   */
  private async checkQueryLogEnabled(): Promise<ConfigValidationCheck> {
    try {
      const result = await this.client.query({
        query: `
          SELECT count() as cnt
          FROM system.tables
          WHERE database = 'system'
          AND name = 'query_log'
        `,
        format: 'JSONEachRow'
      });

      const rows = await result.json() as Array<{ cnt: string }>;
      const actual = parseInt(rows[0]?.cnt || '0', 10);

      return {
        name: 'Query log enabled',
        expected: 1,
        actual,
        passed: actual === 1
      };
    } catch (error) {
      return {
        name: 'Query log enabled',
        expected: 1,
        actual: `Error: ${error instanceof Error ? error.message : String(error)}`,
        passed: false
      };
    }
  }

  /**
   * Parse setting value based on expected type
   */
  private parseSettingValue(value: string, expected: unknown): unknown {
    if (typeof expected === 'number') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? value : parsed;
    }
    if (typeof expected === 'boolean') {
      return value === '1' || value.toLowerCase() === 'true';
    }
    return value;
  }

  /**
   * Compare values with type coercion
   */
  private compareValues(actual: unknown, expected: unknown): boolean {
    if (typeof actual === 'number' && typeof expected === 'number') {
      return Math.abs(actual - expected) < 0.001;
    }
    return actual === expected;
  }

  /**
   * Normalize validation options with defaults
   */
  private normalizeOptions(options?: ConfigValidationOptions): Required<ConfigValidationOptions> {
    return {
      skipUsers: options?.skipUsers ?? false,
      skipProfiles: options?.skipProfiles ?? false,
      skipQuotas: options?.skipQuotas ?? false,
      skipAudit: options?.skipAudit ?? false,
      requiredUsers: options?.requiredUsers ?? DEFAULT_REQUIRED_USERS,
      requiredProfiles: options?.requiredProfiles ?? DEFAULT_REQUIRED_PROFILES,
      requiredQuotas: options?.requiredQuotas ?? DEFAULT_REQUIRED_QUOTAS
    };
  }
}

/**
 * Factory function to create config validator
 *
 * @param client - ClickHouse client instance
 * @param logger - Logger instance
 * @returns Configured validator
 */
export function createClickHouseConfigValidator(
  client: ClickHouseClient,
  logger: ILogger
): IClickHouseConfigValidator {
  return new ClickHouseConfigValidatorAdapter(client, logger);
}
