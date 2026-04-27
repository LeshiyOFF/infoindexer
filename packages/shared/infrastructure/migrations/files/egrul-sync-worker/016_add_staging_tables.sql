-- ═══════════════════════════════════════════════════════════════════
-- Migration 016: Add Staging Tables for FTM Raw Data
-- ═══════════════════════════════════════════════════════════════════
--
-- Architecture: Staging + Transform Pattern
-- ─────────────────────────────────────────────────────────────────────
-- Layer 1: Staging tables store raw FTM entities (as-is from source)
-- Layer 2: Transform service converts to production format
-- Layer 3: Production tables with MV auto-aggregation
--
-- Breaking Change: No (adds new tables, doesn't modify existing)
--
-- Benefits:
-- - Separates raw data ingestion from transformation
-- - Enables replayable transformation logic
-- - Preserves source data for debugging
-- - Follows Hexagonal Architecture (Ports & Adapters)
--
-- ═══════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════
-- STAGING TABLES: Raw FTM Data Storage
-- ═══════════════════════════════════════════════════════════════════

-- Staging Companies: Raw FTM Company entities
CREATE TABLE IF NOT EXISTS egrul_staging_companies (
  id String,
  inn String,
  name String,
  status String,
  address String,
  first_seen DateTime64(3, 'UTC'),
  last_changed DateTime64(3, 'UTC'),
  INDEX idx_inn inn TYPE bloom_filter GRANULARITY 1
) ENGINE = ReplacingMergeTree(last_changed)
ORDER BY (id, inn)
SETTINGS index_granularity = 8192;

-- Staging Directorships: Raw FTM Directorship relationships
CREATE TABLE IF NOT EXISTS egrul_staging_directorships (
  id String,
  organization_id String,
  director_id String,
  role String,
  start_date String,
  end_date Nullable(String),
  INDEX idx_org organization_id TYPE bloom_filter GRANULARITY 1,
  INDEX idx_dir director_id TYPE bloom_filter GRANULARITY 1
) ENGINE = ReplacingMergeTree()
ORDER BY (organization_id, director_id)
SETTINGS index_granularity = 8192;

-- Staging Ownerships: Raw FTM Ownership relationships
CREATE TABLE IF NOT EXISTS egrul_staging_ownerships (
  id String,
  owner_id String,
  asset_id String,
  percentage String,
  shares_count String,
  start_date String,
  end_date Nullable(String),
  INDEX idx_owner owner_id TYPE bloom_filter GRANULARITY 1,
  INDEX idx_asset asset_id TYPE bloom_filter GRANULARITY 1
) ENGINE = ReplacingMergeTree()
ORDER BY (owner_id, asset_id)
SETTINGS index_granularity = 8192;
