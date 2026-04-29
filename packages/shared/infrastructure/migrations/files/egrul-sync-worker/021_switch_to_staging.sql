-- ═══════════════════════════════════════════════════════════════════
-- Migration 021: Switch to Staging + Enable companies_meta VIEW
-- ═══════════════════════════════════════════════════════════════════
--
-- CRITICAL MIGRATION - "Big Switch"
--    Switches system from MV to Staging + Transform pattern
--
-- PREREQUISITES:
-- - Migration 017: MVs dropped (companies_mv, directors_mv, founders_mv)
-- - Migration 018: Production tables created
-- - Migration 019: Transform state initialized
--
-- IMPORTANT: Migration application scenario
--
-- CASE A: Fresh installation (no data in egrul_companies_raw)
--   → PHASE 1 skipped (no data to migrate)
--   → Empty companies_meta VIEW created
--
-- CASE B: Existing data (data exists in egrul_companies_raw)
--   → PHASE 1 migrates data from raw → production
--   → companies_meta VIEW created with data
--
-- ACTIONS:
-- 1. Migrate existing data from raw → production (if any)
-- 2. Create companies_meta VIEW on production (NOT on MV!)
-- 3. TRUNCATE raw (optional, after verification)
--
-- ═══════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════
-- PHASE 1: Migrate existing data (one-time)
-- ═══════════════════════════════════════════════════════════════════

-- === PRE-FLIGHT SANITY CHECKS (optional, run manually before migration) ===
-- 1. Дубли по (inn, updated_at) — оценка риска недетерминизма:
--    SELECT count() FROM (
--      SELECT inn, updated_at FROM egrul_companies_raw
--      GROUP BY inn, updated_at HAVING count() > 1
--    );
--
-- 2. Counts должны совпадать после миграции:
--    SELECT uniqExact(inn) FROM egrul_companies_raw;  -- ожидаемый count(*) в companies_production
--
-- 3. Dry-run (опционально): INSERT INTO ... SELECT ... LIMIT 100 на тестовой таблице

-- Migrate companies from raw to production
INSERT INTO companies_production (inn, name, status, address, updated_at)
SELECT
  inn,
  latest.1 AS name,
  latest.2 AS status,
  latest.3 AS address,
  latest.4 AS updated_at
FROM (
  SELECT
    inn,
    argMax(
      tuple(name, status, address, updated_at),
      updated_at
    ) AS latest
  FROM egrul_companies_raw
  GROUP BY inn
  SETTINGS max_threads = 1  -- Детерминизм: argMax при tie возвращает первую встреченную.
                            -- Без max_threads результат зависит от порядка обработки потоками.
                            -- Для разовой миграции воспроизводимость > параллелизм.
);

-- IMPORTANT: Directors and founders migrate from staging (if data exists)
-- Migration 017 dropped MVs but didn't touch denormalized tables
-- After 017 BatchFlusher writes to staging, not denormalized

-- Migrate directors from staging (if data exists)
INSERT INTO directors_production (inn, director_name, updated_at)
SELECT DISTINCT
  organization_id as inn,
  director_id as director_name,
  now64() as updated_at
FROM egrul_staging_directorships
SETTINGS max_threads = 1;

-- Migrate founders from staging (if data exists)
INSERT INTO founders_production (inn, founder_name, updated_at)
SELECT DISTINCT
  asset_id as inn,
  owner_id as founder_name,
  now64() as updated_at
FROM egrul_staging_ownerships
SETTINGS max_threads = 1;

-- FALLBACK: Migrate from denormalized if staging is empty but denormalized has data
-- This is a backup scenario for systems with data before Migration 017
-- Uncomment below if needed:
-- INSERT INTO directors_production (inn, director_name, updated_at)
-- SELECT DISTINCT inn, director_name, max(updated_at) as updated_at
-- FROM egrul_directors_denormalized
-- GROUP BY inn, director_name
-- SETTINGS max_threads = 1;

-- ═══════════════════════════════════════════════════════════════════
-- PHASE 2: Create companies_meta VIEW
-- ═══════════════════════════════════════════════════════════════════

CREATE VIEW IF NOT EXISTS v_companies_meta AS
SELECT
  c.inn,
  c.name,
  c.status,
  c.address,
  groupArray(DISTINCT d.director_name) as directors,
  groupArray(DISTINCT f.founder_name) as founders,
  max(c.updated_at) as updated_at
FROM companies_production c
LEFT JOIN directors_production d USING (inn)
LEFT JOIN founders_production f USING (inn)
GROUP BY c.inn, c.name, c.status, c.address;

-- Alias for backward compatibility
CREATE VIEW IF NOT EXISTS companies_meta AS SELECT * FROM v_companies_meta;

-- ═══════════════════════════════════════════════════════════════════
-- PHASE 3: Cleanup raw tables (optional)
-- ═══════════════════════════════════════════════════════════════════

-- Uncomment after verification:
-- TRUNCATE TABLE egrul_companies_raw;
-- TRUNCATE TABLE egrul_directors_denormalized;
-- TRUNCATE TABLE egrul_founders_denormalized;
