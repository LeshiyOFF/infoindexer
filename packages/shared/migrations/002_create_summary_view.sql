-- ═══════════════════════════════════════════════════════════════════
-- Migration 002: Create Read View for Financial Reports Summary
-- ═══════════════════════════════════════════════════════════════════
--
-- Этот view предоставляет удобный доступ к агрегированным финансовым отчётам
-- с метаданными компаний - ВСЕ данные приходят из MV, JOIN не требуется.
--
-- Использование: SELECT * FROM financial_reports_summary WHERE inn = '1234567890'
--
-- Architecture:
-- - View читает из MV (не из базовых таблиц)
-- - Merge функции агрегируют состояния из AggregatingMergeTree
-- - Нет JOIN при SELECT (быстро!)
--
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW financial_reports_summary AS
SELECT
  inn,
  argMaxMerge(ogrn_state) as ogrn,
  argMaxMerge(region_state) as region,
  maxMerge(latest_year_state) as latest_year,
  countMerge(records_count_state) as records_count,
  if(
    argMaxMerge(lon_state) != '' AND argMaxMerge(lat_state) != '',
    1,
    0
  ) as has_geo,
  toString(argMaxMerge(lon_state)) as lon,
  toString(argMaxMerge(lat_state)) as lat,
  sumMerge(revenue_state) as revenue,
  sumMerge(net_profit_state) as net_profit,
  sumMerge(charter_capital_state) as charter_capital,
  avgMerge(age_state) as age,
  toString(argMaxMerge(okved_state)) as okved,
  toString(argMaxMerge(director_state)) as director,
  toString(argMaxMerge(name_state)) as name,
  toString(argMaxMerge(status_state)) as status,
  max(updated_at) as updated_at
FROM financial_reports_summary_mv
GROUP BY inn, updated_at;
