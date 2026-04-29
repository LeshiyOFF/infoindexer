/**
 * Type-safe ClickHouse query helper
 *
 * @remarks
 * Provides type-safe query execution for ClickHouse client.
 * Ensures proper type inference without relying on 'as' assertions in business logic.
 */

import type { ClickHouseClient } from '@clickhouse/client';
import type { ResultSet } from '@clickhouse/client';

/**
 * Execute query and return typed JSON rows
 *
 * @remarks
 * This is the ONLY place where 'as' assertion is used.
 * All other code uses this helper for type safety.
 *
 * @param client - ClickHouse client
 * @param query - SQL query
 * @returns Typed array of rows
 *
 * @example
 * ```typescript
 * const rows = await queryJson<CompanyRow>(client, 'SELECT * FROM companies');
 * // rows: CompanyRow[] - fully typed
 * ```
 */
export async function queryJson<T>(
  client: ClickHouseClient,
  query: string
): Promise<T[]> {
  const resultSet = await client.query({
    query,
    format: 'JSONEachRow'
  });

  // Type assertion is isolated to this single function
  // All business logic gets fully typed results
  const rows = (await resultSet.json()) as T[];
  return rows;
}

/**
 * Execute query with parameters and return typed JSON rows
 */
export async function queryJsonParams<T>(
  client: ClickHouseClient,
  query: string,
  params: Record<string, unknown>
): Promise<T[]> {
  const resultSet = await client.query({
    query,
    query_params: params,
    format: 'JSONEachRow'
  });

  const rows = (await resultSet.json()) as T[];
  return rows;
}

/**
 * Re-export ResultSet type for external use
 */
export type { ResultSet };
