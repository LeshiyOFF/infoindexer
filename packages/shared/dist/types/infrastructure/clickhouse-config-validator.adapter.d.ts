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
import type { IClickHouseConfigValidator, ConfigValidationResult, ConfigValidationCheck, ConfigValidationOptions } from './ports/i-config-validator.port';
import type { ILogger } from './ports/i-logger.port';
import type { ClickHouseClient } from '@clickhouse/client';
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
export declare class ClickHouseConfigValidatorAdapter implements IClickHouseConfigValidator {
    private readonly client;
    private readonly logger;
    constructor(client: ClickHouseClient, logger: ILogger);
    validate(options?: ConfigValidationOptions): Promise<ConfigValidationResult>;
    validateSetting(name: string, expected: unknown): Promise<ConfigValidationCheck>;
    /**
     * Check if users exist
     */
    private checkUsersExist;
    /**
     * Check if profiles exist
     *
     * @remarks
     * Profiles are defined in XML config files (profiles.xml).
     * We verify they are loadable by checking system.settings_profiles.
     */
    private checkProfilesExist;
    /**
     * Check if quotas exist
     */
    private checkQuotasExist;
    /**
     * Check if query log is enabled
     */
    private checkQueryLogEnabled;
    /**
     * Parse setting value based on expected type
     */
    private parseSettingValue;
    /**
     * Compare values with type coercion
     */
    private compareValues;
    /**
     * Normalize validation options with defaults
     */
    private normalizeOptions;
}
/**
 * Factory function to create config validator
 *
 * @param client - ClickHouse client instance
 * @param logger - Logger instance
 * @returns Configured validator
 */
export declare function createClickHouseConfigValidator(client: ClickHouseClient, logger: ILogger): IClickHouseConfigValidator;
