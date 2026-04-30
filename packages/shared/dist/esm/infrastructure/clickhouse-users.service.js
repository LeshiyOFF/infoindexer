"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickHouseUsersService = void 0;
exports.createClickHouseUsersService = createClickHouseUsersService;
/**
 * Required usernames for application
 */
const REQUIRED_USERS = {
    ADMIN: 'infoindexer_admin',
    WORKER: 'infoindexer_worker',
    API: 'infoindexer_api'
};
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
class ClickHouseUsersService {
    rbac;
    logger;
    constructor(rbac, logger) {
        this.rbac = rbac;
        this.logger = logger;
    }
    /**
     * Initialize all required users
     *
     * @param config - User credentials and settings
     * @returns Initialization result with details
     */
    async initialize(config) {
        this.logger.info('Initializing ClickHouse users');
        const details = [];
        let createdCount = 0;
        let skippedCount = 0;
        // Create admin user
        const adminResult = await this.createAdminUser(config);
        details.push(adminResult);
        if (adminResult.created)
            createdCount++;
        else
            skippedCount++;
        // Create worker user
        const workerResult = await this.createWorkerUser(config);
        details.push(workerResult);
        if (workerResult.created)
            createdCount++;
        else
            skippedCount++;
        // Create API user
        const apiResult = await this.createApiUser(config);
        details.push(apiResult);
        if (apiResult.created)
            createdCount++;
        else
            skippedCount++;
        // Grant database access
        await this.grantAccess(REQUIRED_USERS.WORKER, config.database);
        await this.grantAccess(REQUIRED_USERS.API, config.database);
        // Disable default user
        let defaultDisabled = false;
        if (config.disableDefault) {
            defaultDisabled = await this.rbac.disableDefaultUser();
        }
        const hasErrors = details.some(d => d.error);
        const success = !hasErrors && createdCount + skippedCount === 3;
        this.logger.info('User initialization complete', {
            success,
            created: createdCount,
            skipped: skippedCount,
            defaultDisabled
        });
        return {
            success,
            createdCount,
            skippedCount,
            details,
            defaultDisabled
        };
    }
    /**
     * Create admin user
     */
    async createAdminUser(config) {
        const result = await this.rbac.createUser({
            username: REQUIRED_USERS.ADMIN,
            password: config.adminPassword,
            networks: ['::/0'],
            profile: 'default',
            quota: 'default',
            accessManagement: true
        });
        return {
            username: REQUIRED_USERS.ADMIN,
            created: result.created,
            error: result.error
        };
    }
    /**
     * Create worker user
     */
    async createWorkerUser(config) {
        const result = await this.rbac.createUser({
            username: REQUIRED_USERS.WORKER,
            password: config.workerPassword,
            networks: ['::/0'],
            profile: 'workers',
            quota: 'default',
            databases: [config.database]
        });
        return {
            username: REQUIRED_USERS.WORKER,
            created: result.created,
            error: result.error
        };
    }
    /**
     * Create API user
     */
    async createApiUser(config) {
        const result = await this.rbac.createUser({
            username: REQUIRED_USERS.API,
            password: config.apiPassword,
            networks: ['::/0'],
            profile: 'readonly',
            quota: 'default',
            databases: [config.database],
            readonly: true
        });
        return {
            username: REQUIRED_USERS.API,
            created: result.created,
            error: result.error
        };
    }
    /**
     * Grant database access to user
     */
    async grantAccess(username, database) {
        const granted = await this.rbac.grantDatabaseAccess(username, database);
        if (!granted) {
            this.logger.warn('Failed to grant database access', { username, database });
        }
    }
    /**
     * Verify all required users exist
     *
     * @returns true if all users exist
     */
    async verify() {
        const users = await this.rbac.getAllUsers();
        const hasAdmin = users.includes(REQUIRED_USERS.ADMIN);
        const hasWorker = users.includes(REQUIRED_USERS.WORKER);
        const hasApi = users.includes(REQUIRED_USERS.API);
        return hasAdmin && hasWorker && hasApi;
    }
}
exports.ClickHouseUsersService = ClickHouseUsersService;
/**
 * Factory function to create users service
 *
 * @param rbac - RBAC manager instance
 * @param logger - Logger instance
 * @returns Configured users service
 */
function createClickHouseUsersService(rbac, logger) {
    return new ClickHouseUsersService(rbac, logger);
}
