/**
 * Health Check Endpoint - Readiness Probe
 *
 * @remarks
 * Part of Iteration 10.2: Config Validation.
 *
 * Architecture:
 * - Checks critical tables existence
 * - Validates ClickHouse configuration
 * - Returns 503 if any check fails
 *
 * Usage:
 *   GET /api/health/ready
 *
 * Response (200):
 *   {
 *     "status": "ready",
 *     "checks": [
 *       { "name": "tables", "status": "ok" },
 *       { "name": "config", "status": "ok" }
 *     ]
 *   }
 *
 * Response (503):
 *   {
 *     "status": "not_ready",
 *     "checks": [...],
 *     "config_errors": [...]
 *   }
 */

import { createClickHouseConfig, createClickHouseConfigValidator, createLogger, LogLevel } from 'shared';
import { createClickHouseClient } from 'shared/clickhouse';

/**
 * Health check result
 */
interface HealthCheck {
  name: string;
  status: string;
}

/**
 * Ready response
 */
interface ReadyResponse {
  status: 'ready' | 'not_ready';
  checks: HealthCheck[];
  config_errors?: string[];
}

const logger = createLogger('health-ready', {
  minLevel: LogLevel.INFO,
  timestamps: true,
  colors: false
});

/**
 * GET /api/health/ready
 *
 * @remarks
 * Readiness probe for container orchestration.
 * Checks database connectivity and configuration.
 */
export async function GET(): Promise<Response> {
  const checks: HealthCheck[] = [];

  // ============================================
  // Check 1: Critical Tables
  // ============================================
  try {
    const config = createClickHouseConfig();
    const client = createClickHouseClient(config);

    const result = await client.query({
      query: `
        SELECT count() as cnt
        FROM system.tables
        WHERE database = currentDatabase()
        AND name IN ('financial_reports_summary', 'companies_meta')
      `,
      format: 'JSONEachRow'
    });

    const tables = await result.json() as Array<{ cnt: string }>;
    const tableCount = parseInt(tables[0]?.cnt || '0', 10);

    if (tableCount < 2) {
      checks.push({ name: 'tables', status: 'missing' });
    } else {
      checks.push({ name: 'tables', status: 'ok' });
    }

    await client.close();
  } catch (error) {
    checks.push({
      name: 'tables',
      status: `error: ${error instanceof Error ? error.message : String(error)}`
    });
  }

  // ============================================
  // Check 2: Configuration Validation 🔥 NEW v3.3
  // ============================================
  try {
    const config = createClickHouseConfig();
    const client = createClickHouseClient(config);
    const validator = createClickHouseConfigValidator(client, logger);

    const configResult = await validator.validate();

    checks.push({
      name: 'config',
      status: configResult.valid ? 'ok' : 'invalid'
    });

    if (!configResult.valid) {
      await client.close();

      const response: ReadyResponse = {
        status: 'not_ready',
        checks,
        config_errors: [...configResult.errors]
      };

      return Response.json(response, { status: 503 });
    }

    await client.close();
  } catch (error) {
    checks.push({
      name: 'config',
      status: `error: ${error instanceof Error ? error.message : String(error)}`
    });
  }

  // ============================================
  // Final Status
  // ============================================
  const allOk = checks.every(c => c.status === 'ok');
  const response: ReadyResponse = {
    status: allOk ? 'ready' : 'not_ready',
    checks
  };

  return Response.json(response, { status: allOk ? 200 : 503 });
}
