/**
 * Audit Log SQL DDL
 *
 * @remarks
 * Infrastructure Layer: DDL statements for audit logging tables.
 * Part of Hexagonal / Ports & Adapters architecture.
 *
 * Iteration 12: Audit Logging
 */
/**
 * Audit log table DDL
 *
 * @remarks
 * Creates the audit_log table in the specified database.
 * Uses MergeTree for performance with partitioning and TTL.
 */
export function createAuditLogDDL(database, tableName = 'audit_log') {
    return `
CREATE TABLE IF NOT EXISTS ${database}.${tableName}
ON CLUSTER '{cluster}' (
  event_date Date DEFAULT today(),
  event_time DateTime64(3, 'UTC') DEFAULT now64(3, 'UTC'),

  -- Event classification
  event_type LowCardinality(String),
  action_type LowCardinality(String),

  -- Actor
  user_id String,

  -- Resource
  resource_type LowCardinality(String),
  resource_id String,

  -- Metadata (JSON)
  metadata String,

  -- System fields
  client_ip Nullable(String),
  user_agent Nullable(String)
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(event_date)
PRIMARY KEY (event_date, user_id, event_type)
ORDER BY (event_date, user_id, event_time, resource_type)
TTL event_date + INTERVAL 90 DAY
SETTINGS
  index_granularity = 8192;
`;
}
/**
 * Default options for audit log
 */
export const AUDIT_LOG_DEFAULTS = {
    tableName: 'audit_log',
    defaultLimit: 1000,
    maxLimit: 10000,
    defaultTtlDays: 90
};
/**
 * Validate table name
 *
 * @remarks
 * Prevents SQL injection in table name.
 */
export function validateTableName(name) {
    return /^[a-z_][a-z0-9_]{0,60}$/.test(name);
}
/**
 * Validate database name
 *
 * @remarks
 * Prevents SQL injection in database name.
 */
export function validateDatabaseName(name) {
    return /^[a-z_][a-z0-9_]{0,60}$/.test(name);
}
