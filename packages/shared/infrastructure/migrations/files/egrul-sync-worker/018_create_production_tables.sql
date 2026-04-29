-- ═══════════════════════════════════════════════════════════════════
-- Migration 018: Create Production Tables
-- ═══════════════════════════════════════════════════════════════════
--
-- Purpose: Creates production tables for aggregated data
--
-- Architecture: Staging (016) → Transform (019) → Production (018)
-- 1. STAGING: egrul_staging_* (already exists from Migration 016)
-- 2. TRANSFORM: EgrulTransformService aggregates data
-- 3. PRODUCTION: companies_production, directors_production, founders_production
-- 4. SERVE: companies_meta VIEW (created in Migration 021)
--
-- ═══════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════
-- Production: companies (aggregated by INN)
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS companies_production (
  inn String,
  name String,
  status String,
  address String,
  updated_at DateTime64(3, 'UTC') DEFAULT now64(),
  INDEX name_idx name TYPE tokenbf_v1(4096, 3, 0) GRANULARITY 1
) ENGINE = ReplacingMergeTree(updated_at)
ORDER BY inn
SETTINGS index_granularity = 8192;

-- ═══════════════════════════════════════════════════════════════════
-- Production: directors (aggregated by INN)
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS directors_production (
  inn String,
  director_name String,
  updated_at DateTime64(3, 'UTC') DEFAULT now64(),
  INDEX director_idx director_name TYPE tokenbf_v1(4096, 3, 0) GRANULARITY 1
) ENGINE = ReplacingMergeTree(updated_at)
ORDER BY (inn, director_name)
SETTINGS index_granularity = 8192;

-- ═══════════════════════════════════════════════════════════════════
-- Production: founders (aggregated by INN)
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS founders_production (
  inn String,
  founder_name String,
  updated_at DateTime64(3, 'UTC') DEFAULT now64(),
  INDEX founder_idx founder_name TYPE tokenbf_v1(4096, 3, 0) GRANULARITY 1
) ENGINE = ReplacingMergeTree(updated_at)
ORDER BY (inn, founder_name)
SETTINGS index_granularity = 8192;

-- ═══════════════════════════════════════════════════════════════════
-- Transform state table
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS egrul_transform_state (
  table_name String,
  last_staging_count UInt64,
  last_transform_at DateTime64(3, 'UTC'),
  status Enum8('idle' = 0, 'running' = 1, 'error' = 2),
  error_message String,
  updated_at DateTime64(3, 'UTC') DEFAULT now64()
) ENGINE = MergeTree()
ORDER BY table_name;
