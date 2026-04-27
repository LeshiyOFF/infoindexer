/**
 * ClickHouse RBAC Adapter
 *
 * @remarks
 * Infrastructure Layer: SQL-based user management.
 * Part of Hexagonal / Ports & Adapters architecture.
 *
 * Architecture:
 * - Port (Domain Layer): IClickHouseRBACManager
 * - Adapter (Infrastructure Layer): This class
 *
 * Implementation:
 * - Uses ClickHouse SQL commands for user management
 * - IF NOT EXISTS for idempotent operations
 * - Transactional where supported
 *
 * Iteration 10: RBAC + Users
 */
import type { IClickHouseRBACManager, ClickHouseUser, UserCreationResult, UserExistenceResult } from './ports/i-clickhouse-rbac.port';
import type { ILogger } from './ports/i-logger.port';
import type { ClickHouseClient } from '@clickhouse/client';
/**
 * ClickHouse RBAC Manager Implementation
 *
 * @remarks
 * Executes SQL commands for user management.
 * Requires admin privileges for user creation.
 *
 * @example
 * ```ts
 * const rbac = new ClickHouseRBACAdapter(client, logger);
 * await rbac.createUser({
 *   username: 'infoindexer_worker',
 *   password: 'secure_password',
 *   profile: 'workers',
 *   quota: 'default',
 *   databases: ['infoindexer']
 * });
 * ```
 */
export declare class ClickHouseRBACAdapter implements IClickHouseRBACManager {
    private readonly client;
    private readonly logger;
    constructor(client: ClickHouseClient, logger: ILogger);
    createUser(user: ClickHouseUser): Promise<UserCreationResult>;
    userExists(username: string): Promise<UserExistenceResult>;
    disableDefaultUser(): Promise<boolean>;
    grantDatabaseAccess(username: string, database: string): Promise<boolean>;
    getAllUsers(): Promise<string[]>;
    /**
     * Format networks clause for CREATE USER
     */
    private formatNetworks;
    /**
     * Format databases clause for CREATE USER
     */
    private formatDatabases;
    /**
     * Build CREATE USER query
     */
    private buildCreateUserQuery;
}
/**
 * Factory function to create RBAC adapter
 *
 * @param client - ClickHouse client instance
 * @param logger - Logger instance
 * @returns Configured RBAC adapter
 */
export declare function createClickHouseRBACAdapter(client: ClickHouseClient, logger: ILogger): IClickHouseRBACManager;
