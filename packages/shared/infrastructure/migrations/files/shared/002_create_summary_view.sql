-- ═══════════════════════════════════════════════════════════════════
-- Migration 002: Create Read View for Financial Reports Summary
-- ═══════════════════════════════════════════════════════════════════
--
-- ИСПРАВЛЕНО v6.2: CLEAN ARCHITECTURE
-- - Убран LEFT JOIN с companies_meta
-- - View содержит только финансовые агрегаты из MV
-- - Company metadata запрашивается отдельно через companies_meta таблицу
--
-- Этот view предоставляет удобный доступ к агрегированным финансовым отчётам.
-- Все данные приходят из MV, JOIN не требуется.
--
-- Использование: SELECT * FROM financial_reports_summary WHERE inn = '1234567890'
--
-- Architecture:
-- - View читает из MV (не из базовых таблиц)
-- - *Merge функции агрегируют состояния из AggregatingMergeTree
-- - Нет GROUP BY — MV уже сгруппирован
-- - *Merge функции возвращают правильные типы
--
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW financial_reports_summary AS
SELECT
  inn,
  -- Разворачиваем состояния (используем *Merge функции)
  -- *Merge возвращает исходный тип: String для String State
  argMaxMerge(ogrn_state) as ogrn,
  argMaxMerge(region_state) as region,
  maxMerge(latest_year_state) as latest_year,
  countMerge(records_count_state) as records_count,
  -- Geo: convert state to has_geo flag
  if(
    argMaxMerge(lon_state) != '' AND argMaxMerge(lat_state) != '',
    1,
    0
  ) as has_geo,
  argMaxMerge(lon_state) as lon,
  argMaxMerge(lat_state) as lat,
  -- Финансовые показатели (sumMerge возвращает Float64)
  sumMerge(revenue_state) as revenue,
  sumMerge(net_profit_state) as net_profit,
  sumMerge(charter_capital_state) as charter_capital,
  -- avgMerge возвращает Float64
  avgMerge(age_state) as age,
  argMaxMerge(okved_state) as okved,
  -- updated_at из MV для TTL совместимости
  maxMerge(updated_at_state) as updated_at
FROM financial_reports_summary_mv
GROUP BY inn;
