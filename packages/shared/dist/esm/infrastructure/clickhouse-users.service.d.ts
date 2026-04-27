/**
 * ClickHouse Users Initialization Service
 *
 * @remarks
 * Application Layer: Business logic for user initialization.
 * Part of Hexagonal / Ports & Adapters architecture.
 *
 * Architecture:
 * - Port (Domain Layer): IClickHouseRBACManager
 * - Service (Application Layer): This class
 * - Adapter (Infrastructure Layer): ClickHouseRBACAdapter
 *
 * Design Decision: Separate Service
 * - Contains business logic (which users to create)
 * - Port contains only CRUD operations
 * - Easier to test and modify
 *
 * Iteration 10: RBAC + Users
 */
import type { IClickHouseRBACManager, UserInitConfig, UserInitResult } from './ports/i-clickhouse-rbac.port';
import type { ILogger } from './ports/i-logger.port';
/**
 * ClickHouse Users Initialization Service
 *
 * @remarks
 * Creates required users for the application.
 * Idempotent: safe to run multiple times.
 *
 * @example
 * ```ts
 * const service = new ClickHouseUsersService(rbacManager, logger);
 * const result = await service.initialize({
 *   adminPassword: 'secure_admin_pass',
 *   workerPassword: 'secure_worker_pass',
 *   apiPassword: 'secure_api_pass',
 *   database: 'infoindexer',
 *   disableDefault: true
 * });
 * ```
 */
export declare class ClickHouseUsersService {
    private readonly rbac;
    private readonly logger;
    constructor(rbac: IClickHouseRBACManager, logger: ILogger);
    /**
     * Initialize all required users
     *
     * @param config - User credentials and settings
     * @returns Initialization result with details
     */
    initialize(config: UserInitConfig): Promise<UserInitResult>;
    /**
     * Create admin user
     */
    private createAdminUser;
    /**
     * Create worker user
     */
    private createWorkerUser;
    /**
     * Create API user
     */
    private createApiUser;
    /**
     * Grant database access to user
     */
    private grantAccess;
    /**
     * Verify all required users exist
     *
     * @returns true if all users exist
     */
    verify(): Promise<boolean>;
}
/**
 * Factory function to create users service
 *
 * @param rbac - RBAC manager instance
 * @param logger - Logger instance
 * @returns Configured users service
 */
export declare function createClickHouseUsersService(rbac: IClickHouseRBACManager, logger: ILogger): ClickHouseUsersService;
