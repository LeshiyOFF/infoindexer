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

import type {
  IClickHouseRBACManager,
  ClickHouseUser,
  UserCreationResult,
  UserExistenceResult
} from './ports/i-clickhouse-rbac.port';
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
export class ClickHouseRBACAdapter implements IClickHouseRBACManager {
  constructor(
    private readonly client: ClickHouseClient,
    private readonly logger: ILogger
  ) {}

  async createUser(user: ClickHouseUser): Promise<UserCreationResult> {
    try {
      this.logger.info('Creating ClickHouse user', { username: user.username });

      const networks = this.formatNetworks(user.networks);
      const databases = this.formatDatabases(user.databases);

      const query = this.buildCreateUserQuery(user, networks, databases);

      await this.client.command({
        query
      });

      this.logger.info('User created successfully', { username: user.username });

      return {
        username: user.username,
        created: true
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      if (message.includes('already exists')) {
        this.logger.debug('User already exists', { username: user.username });
        return {
          username: user.username,
          created: false
        };
      }

      this.logger.error('Failed to create user', {
        username: user.username,
        error: message
      });

      return {
        username: user.username,
        created: false,
        error: message
      };
    }
  }

  async userExists(username: string): Promise<UserExistenceResult> {
    try {
      const result = await this.client.query({
        query: `
          SELECT count() as cnt
          FROM system.users
          WHERE name = {username:String}
        `,
        query_params: { username },
        format: 'JSONEachRow'
      });

      const rows = await result.json() as Array<{ cnt: string }>;
      const count = parseInt(rows[0]?.cnt || '0', 10);

      return {
        username,
        exists: count > 0
      };
    } catch (error) {
      this.logger.error('Failed to check user existence', {
        username,
        error: error instanceof Error ? error.message : String(error)
      });

      return {
        username,
        exists: false
      };
    }
  }

  async disableDefaultUser(): Promise<boolean> {
    try {
      this.logger.info('Disabling default user');

      await this.client.command({
        query: 'DROP USER IF EXISTS default'
      });

      this.logger.info('Default user disabled');
      return true;
    } catch (error) {
      this.logger.error('Failed to disable default user', {
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  async grantDatabaseAccess(username: string, database: string): Promise<boolean> {
    try {
      this.logger.info('Granting database access', { username, database });

      await this.client.command({
        query: `GRANT ALL ON ${database}.* TO ${username}`
      });

      this.logger.info('Database access granted', { username, database });
      return true;
    } catch (error) {
      this.logger.error('Failed to grant database access', {
        username,
        database,
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  async getAllUsers(): Promise<string[]> {
    try {
      const result = await this.client.query({
        query: 'SELECT name FROM system.users ORDER BY name',
        format: 'JSONEachRow'
      });

      const rows = await result.json() as Array<{ name: string }>;
      return rows.map(row => row.name);
    } catch (error) {
      this.logger.error('Failed to get users', {
        error: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }

  /**
   * Format networks clause for CREATE USER
   */
  private formatNetworks(networks?: readonly string[]): string {
    if (!networks || networks.length === 0) {
      return '::/0';
    }

    return networks.map(n => `'${n}'`).join(', ');
  }

  /**
   * Format databases clause for CREATE USER
   */
  private formatDatabases(databases?: readonly string[]): string {
    if (!databases || databases.length === 0) {
      return '';
    }

    const dbList = databases.map(d => `'${d}'`).join(', ');
    return `ALLOWED DATABASES ${dbList}`;
  }

  /**
   * Build CREATE USER query
   */
  private buildCreateUserQuery(
    user: ClickHouseUser,
    networks: string,
    databases: string
  ): string {
    const parts: string[] = [
      `CREATE USER IF NOT EXISTS ${user.username}`,
      `IDENTIFIED WITH plaintext_password BY '${user.password}'`,
      `HOST ${networks}`,
      `SETTINGS PROFILE '${user.profile}'`,
      `QUOTA '${user.quota}'`
    ];

    if (databases) {
      parts.push(databases);
    }

    if (user.accessManagement) {
      parts.push('ACCESS MANAGEMENT 1');
    }

    if (user.readonly) {
      parts.push('READONLY 1');
    }

    return parts.join('\n    ');
  }
}

/**
 * Factory function to create RBAC adapter
 *
 * @param client - ClickHouse client instance
 * @param logger - Logger instance
 * @returns Configured RBAC adapter
 */
export function createClickHouseRBACAdapter(
  client: ClickHouseClient,
  logger: ILogger
): IClickHouseRBACManager {
  return new ClickHouseRBACAdapter(client, logger);
}
