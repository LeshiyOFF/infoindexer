-- ═══════════════════════════════════════════════════════════════════
-- Migration 001: Create Materialized View for Financial Reports Summary
-- ═══════════════════════════════════════════════════════════════════
--
-- Architecture Decision:
-- - Materialized View обеспечивает real-time агрегацию
-- - Auto-updates на INSERT в financial_reports
-- - Не требуется ручное обновление
-- - Memory efficient: инкрементальные обновления
--
-- Memory Calculation:
-- - INSERT incremental: ~200MB per batch vs 5.6GB
-- - MV хранит агрегированное состояние: ~50MB total
--
-- ВАЖНО: Поля companies_meta включены через LEFT JOIN.
-- MV обновляется при INSERT в financial_reports. Изменения в companies_meta
-- синхронизируются через worker (см. Migration 003).
--
-- ═══════════════════════════════════════════════════════════════════

CREATE MATERIALIZED VIEW IF NOT EXISTS financial_reports_summary_mv
ENGINE = AggregatingMergeTree()
ORDER BY (-revenue, inn)
PARTITION BY toYYYYMM(makeDate(latest_year, 1, 1))
TTL max(updated_at) + INTERVAL 5 YEAR
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
  avgState(toFloat32OrZero(toString(fr.age))) as age_state,
  argMaxState(fr.okved, fr.year) as okved_state,
  -- Companies meta aggregates (обновляется через worker при изменениях)
  argMaxState(cm.director, cm.updated_at) as director_state,
  argMaxState(cm.name, cm.updated_at) as name_state,
  argMaxState(cm.status, cm.updated_at) as status_state,
  max(fr.updated_at) as updated_at
FROM financial_reports fr
LEFT JOIN companies_meta cm ON fr.inn = cm.inn
GROUP BY fr.inn;

-- Создаём projection для общих паттернов запросов
ALTER TABLE financial_reports_summary_mv
ADD PROJECTION IF NOT EXISTS by_region (
  SELECT *
  ORDER BY (region, -revenue, inn)
);

ALTER TABLE financial_reports_summary_mv
ADD PROJECTION IF NOT EXISTS by_year (
  SELECT *
  ORDER BY (latest_year, -revenue, inn)
);
