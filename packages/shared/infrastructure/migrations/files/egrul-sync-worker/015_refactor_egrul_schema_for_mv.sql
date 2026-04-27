-- ═══════════════════════════════════════════════════════════════════
-- Migration 015: Refactor EGRUL Schema for Materialized View (Variant B)
-- ═══════════════════════════════════════════════════════════════════
--
-- Architecture Decision (Variant B: Schema Refactor)
-- ─────────────────────────────────────────────────────────────────────
-- Remove intermediate transform layer (persons_raw, directorships_raw, ownerships_raw)
-- Refactor existing tables for MV compatibility
-- Create Three Materialized Views for incremental aggregation
-- companies_meta becomes VIEW (not table)
--
-- Breaking Change: Requires TypeScript code changes
--
-- Memory Impact: 5.6GB → ~200MB (28x reduction)
--
-- ═══════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════
-- PHASE 1: Remove intermediate tables (no longer needed)
-- ═══════════════════════════════════════════════════════════════════

DROP TABLE IF EXISTS egrul_persons_raw;
DROP TABLE IF EXISTS egrul_directorships_raw;
DROP TABLE IF EXISTS egrul_ownerships_raw;

-- ═══════════════════════════════════════════════════════════════════
-- PHASE 2: Recreate core tables with correct schema
-- ═══════════════════════════════════════════════════════════════════

-- Recreate egrul_companies_raw (ORDER BY inn, not id!)
DROP TABLE IF EXISTS egrul_companies_raw;
CREATE TABLE egrul_companies_raw (
  inn String,
  name String,
  status String,
  address String,
  updated_at DateTime64(3, 'UTC') DEFAULT now64(),
  INDEX name_idx name TYPE tokenbf_v1(4096, 3, 0) GRANULARITY 1,
  INDEX status_idx status TYPE set(10) GRANULARITY 1
) ENGINE = ReplacingMergeTree(updated_at)
ORDER BY inn
SETTINGS index_granularity = 8192;

-- Recreate egrul_directors_denormalized (simplified, no role field)
DROP TABLE IF EXISTS egrul_directors_denormalized;
CREATE TABLE egrul_directors_denormalized (
  inn String,
  director_name String,
  updated_at DateTime64(3, 'UTC') DEFAULT now64(),
  INDEX director_idx director_name TYPE tokenbf_v1(4096, 3, 0) GRANULARITY 1
) ENGINE = ReplacingMergeTree(updated_at)
ORDER BY (inn, director_name)
SETTINGS index_granularity = 8192;

-- Recreate egrul_founders_denormalized (simplified, no percentage field)
DROP TABLE IF EXISTS egrul_founders_denormalized;
CREATE TABLE egrul_founders_denormalized (
  inn String,
  founder_name String,
  updated_at DateTime64(3, 'UTC') DEFAULT now64(),
  INDEX founder_idx founder_name TYPE tokenbf_v1(4096, 3, 0) GRANULARITY 1
) ENGINE = ReplacingMergeTree(updated_at)
ORDER BY (inn, founder_name)
SETTINGS index_granularity = 8192;

-- ═══════════════════════════════════════════════════════════════════
-- PHASE 3: Create Materialized Views (Three MV Pattern)
-- ═══════════════════════════════════════════════════════════════════

-- MV 1: companies_mv (triggers on INSERT into egrul_companies_raw)
DROP TABLE IF EXISTS companies_mv;
CREATE MATERIALIZED VIEW companies_mv
ENGINE = AggregatingMergeTree()
ORDER BY inn AS
SELECT
  inn,
  argMaxState(name, updated_at) as name_state,
  argMaxState(status, updated_at) as status_state,
  argMaxState(address, updated_at) as address_state,
  maxState(updated_at) as updated_at_state
FROM egrul_companies_raw
GROUP BY inn;

-- MV 2: directors_mv (triggers on INSERT into egrul_directors_denormalized)
DROP TABLE IF EXISTS directors_mv;
CREATE MATERIALIZED VIEW directors_mv
ENGINE = AggregatingMergeTree()
ORDER BY inn AS
SELECT
  inn,
  groupArrayState(director_name) as directors_state
FROM egrul_directors_denormalized
GROUP BY inn;

-- MV 3: founders_mv (triggers on INSERT into egrul_founders_denormalized)
DROP TABLE IF EXISTS founders_mv;
CREATE MATERIALIZED VIEW founders_mv
ENGINE = AggregatingMergeTree()
ORDER BY inn AS
SELECT
  inn,
  groupArrayState(founder_name) as founders_state
FROM egrul_founders_denormalized
GROUP BY inn;

-- ═══════════════════════════════════════════════════════════════════
-- PHASE 4: Create read VIEW
-- ═══════════════════════════════════════════════════════════════════

DROP VIEW IF EXISTS v_companies_meta;
CREATE VIEW v_companies_meta AS
SELECT
  c.inn AS inn,
  argMaxMerge(c.name_state) as name,
  argMaxMerge(c.status_state) as status,
  argMaxMerge(c.address_state) as address,
  arrayFilter(x -> x != '', groupArrayMerge(d.directors_state)) as director,
  arrayFilter(x -> x != '', groupArrayMerge(f.founders_state)) as founders,
  maxMerge(c.updated_at_state) as updated_at
FROM companies_mv c
LEFT JOIN directors_mv d USING (inn)
LEFT JOIN founders_mv f USING (inn)
GROUP BY c.inn;

-- ═══════════════════════════════════════════════════════════════════
-- PHASE 5: companies_meta as VIEW for backward compatibility
-- ═══════════════════════════════════════════════════════════════════

-- Drop old companies_meta TABLE (from migration 003/shared)
-- Note: May be in different database, use IF EXISTS
DROP TABLE IF EXISTS companies_meta;

-- Create companies_meta as VIEW (alias for v_companies_meta)
CREATE VIEW companies_meta AS SELECT * FROM v_companies_meta;
