"use strict";
/**
 * Audit Log Query SQL
 *
 * @remarks
 * Infrastructure Layer: Query templates for audit log retrieval.
 * Separated from DDL for SRP compliance.
 *
 * Iteration 12: Audit Logging
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuditLogSelectByUser = createAuditLogSelectByUser;
exports.createAuditLogSelectByResource = createAuditLogSelectByResource;
exports.createAuditLogSelectByType = createAuditLogSelectByType;
exports.createAuditLogCountByUser = createAuditLogCountByUser;
exports.createAuditLogStats = createAuditLogStats;
/**
 * Query audit events by user
 *
 * @remarks
 * Fetches all audit events for a specific user within a time range.
 */
function createAuditLogSelectByUser(database, tableName = 'audit_log') {
    return `
SELECT
  event_time,
  event_type,
  action_type,
  resource_type,
  resource_id,
  metadata,
  client_ip
FROM ${database}.${tableName}
WHERE user_id = {user_id:String}
  AND event_time >= {from_date:DateTime64}
  AND event_time <= {to_date:DateTime64}
ORDER BY event_time DESC
LIMIT {limit:UInt32}
`;
}
/**
 * Query audit events by resource
 *
 * @remarks
 * Fetches all audit events for a specific resource.
 */
function createAuditLogSelectByResource(database, tableName = 'audit_log') {
    return `
SELECT
  event_time,
  event_type,
  action_type,
  user_id,
  metadata,
  client_ip
FROM ${database}.${tableName}
WHERE resource_type = {resource_type:String}
  AND resource_id = {resource_id:String}
ORDER BY event_time DESC
LIMIT {limit:UInt32}
`;
}
/**
 * Query audit events by type
 *
 * @remarks
 * Fetches audit events filtered by event type.
 */
function createAuditLogSelectByType(database, tableName = 'audit_log') {
    return `
SELECT
  event_time,
  event_type,
  action_type,
  user_id,
  resource_type,
  resource_id
FROM ${database}.${tableName}
WHERE event_type = {event_type:String}
  AND event_time >= {from_date:DateTime64}
ORDER BY event_time DESC
LIMIT {limit:UInt32}
`;
}
/**
 * Count audit events by user
 *
 * @remarks
 * Returns count of audit events for a user within time range.
 */
function createAuditLogCountByUser(database, tableName = 'audit_log') {
    return `
SELECT count() as total
FROM ${database}.${tableName}
WHERE user_id = {user_id:String}
  AND event_time >= {from_date:DateTime64}
  AND event_time <= {to_date:DateTime64}
`;
}
/**
 * Get audit statistics
 *
 * @remarks
 * Aggregates audit events by type for reporting.
 */
function createAuditLogStats(database, tableName = 'audit_log') {
    return `
SELECT
  event_type,
  action_type,
  count() as total,
  count(DISTINCT user_id) as unique_users
FROM ${database}.${tableName}
WHERE event_time >= {from_date:DateTime64}
GROUP BY event_type, action_type
ORDER BY total DESC
`;
}
