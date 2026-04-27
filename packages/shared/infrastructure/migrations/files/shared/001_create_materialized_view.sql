-- ═══════════════════════════════════════════════════════════════════
-- Migration 001: Create Materialized View for Financial Reports Summary
-- ═══════════════════════════════════════════════════════════════════
--
-- ИСПРАВЛЕНО v6.1: AggregatingMergeTree совместимый SQL
--
-- Architecture Decision:
-- - Materialized View обеспечивает real-time агрегацию
-- - Auto-updates на INSERT в financial_reports
-- - Хранит только агрегатные состояния (*_state)
--
-- ВАЖНО: updated_at НЕ включён в MV — нельзя смешивать *_state с обычными колонками.
-- View (002) добавляет now() as updated_at для TTL совместимости.
--
-- Ограничения AggregatingMergeTree:
-- - ORDER BY только по скалярным колонкам (inn), без выражений
-- - Нельзя смешивать *_state с regular колонками
-- - PARTITION BY с *_state колонками не поддерживается
-- - MaterializedView не поддерживает PROJECTION
--
-- ═══════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════
-- PHASE 1: Создаём базовую companies_meta (для View совместимости)
-- Полная версия создаётся в egrul-sync-worker/003
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS companies_meta (
  inn String,
  name String DEFAULT '',
  director String DEFAULT '',
  status String DEFAULT '',
  address String DEFAULT '',
  founders Array(String) DEFAULT [],
  sanctions Array(String) DEFAULT [],
  updated_at DateTime DEFAULT now(),
  INDEX name_idx name TYPE tokenbf_v1(4096, 3, 0) GRANULARITY 1,
  INDEX director_idx director TYPE tokenbf_v1(4096, 3, 0) GRANULARITY 1,
  INDEX status_idx status TYPE set(10) GRANULARITY 1
) ENGINE = ReplacingMergeTree(updated_at)
ORDER BY inn
TTL updated_at + INTERVAL 5 YEAR
SETTINGS index_granularity = 8192;

-- ═══════════════════════════════════════════════════════════════════
-- PHASE 2: MV without companies_meta JOIN (агрегирует только financial_reports)
-- companies_meta подмешивается через View (LEFT JOIN на лету)
-- ═══════════════════════════════════════════════════════════════════

CREATE MATERIALIZED VIEW IF NOT EXISTS financial_reports_summary_mv
ENGINE = AggregatingMergeTree()
ORDER BY inn
POPULATE
AS SELECT
  fr.inn,
  -- Financial reports aggregates (состояния для AggregatingMergeTree)
  argMaxState(fr.ogrn, fr.year) as ogrn_state,
  argMaxState(fr.region, fr.year) as region_state,
  argMaxState(fr.lon, fr.year) as lon_state,
  argMaxState(fr.lat, fr.year) as lat_state,
  maxState(fr.year) as latest_year_state,
  countState() as records_count_state,
  sumState(toFloat64OrZero(toString(fr.PL_revenue))) as revenue_state,
  sumState(toFloat64OrZero(toString(fr.PL_net_profit))) as net_profit_state,
  sumState(toFloat64OrZero(toString(fr.B_charter_capital))) as charter_capital_state,
  -- age имеет Float32 тип в исходной таблице, преобразуем в Float64 для avgState
  avgState(toFloat64OrZero(toString(fr.age))) as age_state,
  argMaxState(fr.okved, fr.year) as okved_state,
  -- updated_at для TTL (берём максимальное значение из financial_reports)
  maxState(fr.updated_at) as updated_at_state
FROM financial_reports fr
GROUP BY fr.inn;
