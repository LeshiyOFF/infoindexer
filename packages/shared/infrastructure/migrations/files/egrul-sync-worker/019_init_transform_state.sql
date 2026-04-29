-- ═══════════════════════════════════════════════════════════════════
-- Migration 019: Initialize Transform State
-- ═══════════════════════════════════════════════════════════════════
--
-- Purpose: Initialize transform state for all staging tables
--
-- Table names correspond to Migration 016:
--   egrul_staging_companies
--   egrul_staging_directorships
--   egrul_staging_ownerships
--
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO egrul_transform_state (table_name, last_staging_count, last_transform_at, status)
VALUES
  ('egrul_staging_companies', 0, toDateTime64('1970-01-01 00:00:00', 3, 'UTC'), 'idle'),
  ('egrul_staging_directorships', 0, toDateTime64('1970-01-01 00:00:00', 3, 'UTC'), 'idle'),
  ('egrul_staging_ownerships', 0, toDateTime64('1970-01-01 00:00:00', 3, 'UTC'), 'idle');
