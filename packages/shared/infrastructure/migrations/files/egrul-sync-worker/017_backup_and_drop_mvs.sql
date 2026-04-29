-- ═══════════════════════════════════════════════════════════════════
-- Migration 017: Backup and Drop Problematic Materialized Views
-- ═══════════════════════════════════════════════════════════════════
--
-- Problem: AggregatingMergeTree MV causes OOM at ~1M rows
-- Solution: Backup + Drop MV → Use staging tables (Migration 016)
--
-- Breaking Change: companies_meta VIEW temporarily unavailable
--    Will be restored in Migration 021 after Transform Service
--
-- Side effects:
-- - egrul_companies_raw no longer triggers MV
-- - v_companies_meta VIEW temporarily dropped
-- - companies_meta temporarily unavailable
--
-- ═══════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════
-- PHASE 1: BACKUP existing data (optional)
-- ═══════════════════════════════════════════════════════════════════

-- Create backup table if rollback needed
CREATE TABLE IF NOT EXISTS companies_mv_backup
ENGINE = AggregatingMergeTree()
ORDER BY inn
EMPTY AS SELECT * FROM companies_mv WHERE 0;

-- Backup data if MV exists
INSERT INTO companies_mv_backup
SELECT
  inn,
  argMaxState(name, updated_at) as name_state,
  argMaxState(status, updated_at) as status_state,
  argMaxState(address, updated_at) as address_state,
  maxState(updated_at) as updated_at_state
FROM egrul_companies_raw
GROUP BY inn
SETTINGS max_threads = 1;

-- Backup directors MV
CREATE TABLE IF NOT EXISTS directors_mv_backup
ENGINE = AggregatingMergeTree()
ORDER BY inn
EMPTY AS SELECT * FROM directors_mv WHERE 0;

INSERT INTO directors_mv_backup
SELECT
  inn,
  groupArrayState(director_name) as directors_state
FROM egrul_directors_denormalized
GROUP BY inn
SETTINGS max_threads = 1;

-- Backup founders MV
CREATE TABLE IF NOT EXISTS founders_mv_backup
ENGINE = AggregatingMergeTree()
ORDER BY inn
EMPTY AS SELECT * FROM founders_mv WHERE 0;

INSERT INTO founders_mv_backup
SELECT
  inn,
  groupArrayState(founder_name) as founders_state
FROM egrul_founders_denormalized
GROUP BY inn
SETTINGS max_threads = 1;

-- ═══════════════════════════════════════════════════════════════════
-- PHASE 2: DROP Materialized Views
-- ═══════════════════════════════════════════════════════════════════

DROP TABLE IF EXISTS companies_mv;
DROP TABLE IF EXISTS directors_mv;
DROP TABLE IF EXISTS founders_mv;

-- ═══════════════════════════════════════════════════════════════════
-- PHASE 3: DROP VIEWs (temporarily, will be restored in 021)
-- ═══════════════════════════════════════════════════════════════════

DROP VIEW IF EXISTS v_companies_meta;
DROP VIEW IF EXISTS companies_meta;

-- Note: companies_meta will be restored as VIEW in Migration 021
-- after Transform Service starts populating production tables
