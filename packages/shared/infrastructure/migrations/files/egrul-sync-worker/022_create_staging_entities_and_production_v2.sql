-- Migration 022: Create staging_entities and refactor production tables for proper resolution.
--
-- Architecture:
--   - egrul_staging_entities: unified table for all FTM entities (Person, Company, Organization, LegalEntity).
--     Replaces egrul_staging_companies which only stored entities with INN.
--   - Production tables: extended schema with Nullable fields for proper unresolved-data handling.
--   - companies_meta VIEW: promised by migration 021, never created. Created here.
--
-- Production tables are currently empty (verified before migration). DROP+CREATE is safe.
--
-- Old egrul_staging_companies and egrul_companies_raw are NOT dropped here.
-- They will be dropped in commit 7 after successful end-to-end test.

-- ============================================================
-- Phase 1: Create unified staging table for all FTM entities
-- ============================================================

CREATE TABLE IF NOT EXISTS egrul_staging_entities (
    id            String,
    schema        String,
    inn           Nullable(String),
    name          Nullable(String),
    status        Nullable(String),
    address       Nullable(String),
    first_seen    DateTime64(3, 'UTC'),
    last_changed  DateTime64(3, 'UTC'),
    INDEX idx_inn inn TYPE bloom_filter GRANULARITY 1,
    INDEX idx_schema schema TYPE bloom_filter GRANULARITY 1
) ENGINE = ReplacingMergeTree(last_changed)
ORDER BY (id)
SETTINGS index_granularity = 8192;

-- ============================================================
-- Phase 2: Drop and recreate production tables with extended schema.
-- Tables are currently empty (verified).
-- ============================================================

DROP TABLE IF EXISTS companies_production;
CREATE TABLE companies_production (
    inn          String,
    name         Nullable(String),
    status       Nullable(String),
    address      Nullable(String),
    updated_at   DateTime64(3, 'UTC') DEFAULT now64()
) ENGINE = ReplacingMergeTree(updated_at)
ORDER BY inn
SETTINGS index_granularity = 8192;

DROP TABLE IF EXISTS directors_production;
CREATE TABLE directors_production (
    inn_company    String,
    director_id    String,
    director_name  Nullable(String),
    director_inn   Nullable(String),
    updated_at     DateTime64(3, 'UTC') DEFAULT now64(),
    INDEX director_name_idx director_name TYPE tokenbf_v1(4096, 3, 0) GRANULARITY 1
) ENGINE = ReplacingMergeTree(updated_at)
ORDER BY (inn_company, director_id)
SETTINGS index_granularity = 8192;

DROP TABLE IF EXISTS founders_production;
CREATE TABLE founders_production (
    inn_company    String,
    founder_id     String,
    founder_name   Nullable(String),
    founder_inn    Nullable(String),
    updated_at     DateTime64(3, 'UTC') DEFAULT now64(),
    INDEX founder_name_idx founder_name TYPE tokenbf_v1(4096, 3, 0) GRANULARITY 1
) ENGINE = ReplacingMergeTree(updated_at)
ORDER BY (inn_company, founder_id)
SETTINGS index_granularity = 8192;

-- ============================================================
-- Phase 3: Create companies_meta VIEW
-- (promised by migration 021, never created)
-- ============================================================

DROP VIEW IF EXISTS companies_meta;
CREATE VIEW companies_meta AS
SELECT
    c.inn,
    c.name,
    c.status,
    c.address,
    argMax(d.director_name, d.updated_at) AS director,
    groupUniqArray(f.founder_name) AS founders,
    c.updated_at
FROM companies_production c
LEFT JOIN directors_production d ON d.inn_company = c.inn
LEFT JOIN founders_production f ON f.inn_company = c.inn
GROUP BY c.inn, c.name, c.status, c.address, c.updated_at;

-- ============================================================
-- Phase 4: Drop dead MV backups
-- (created by migration 017, never used)
-- ============================================================

DROP TABLE IF EXISTS companies_mv_backup;
DROP TABLE IF EXISTS directors_mv_backup;
DROP TABLE IF EXISTS founders_mv_backup;
