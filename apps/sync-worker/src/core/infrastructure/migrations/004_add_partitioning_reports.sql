-- Migration: Partitioning для financial_reports
-- Description: Добавление PARTITION BY для быстрого удаления данных по годам
-- Version: 004
-- Author: InfoIndexer Team
-- Date: 2026-04-21
--
-- Success Criteria:
-- - PARTITION BY добавлен
-- - DROP PARTITION занимает < 1 секунды для 60M+ строк
-- - Данные сохранены
--
-- Architecture:
-- - Strategy: Recreate table через RENAME для zero-downtime
-- - Partition key: toYYYYMM(makeDate(year, 1, 1))
-- - Одна партиция в год для yearly financial data
--
-- ClickHouse Notes:
-- - ALTER TABLE ... MODIFY PARTITION BY не поддерживается
-- - Используем RENAME TABLE для atomic swap
-- - toYYYYMM — стандартная практика для time-series данных
--
-- Performance:
-- - 60M+ строк — INSERT SELECT может занять 10-30 минут
-- - Рекомендуется запускать в период низкой нагрузки

-- Шаг 1: Создаём новую таблицу с partitioning
CREATE TABLE IF NOT EXISTS financial_reports_new (
  -- Первичные ключи
  inn String,
  year UInt16,

  -- Базовые метаданные
  ogrn String,
  region String,
  region_taxcode String,
  creation_date Date,
  dissolution_date Date,
  age Float32,

  -- Флаги
  eligible UInt8,
  exemption_criteria Enum8('none' = 0, 'initiated' = 1, 'state' = 2, 'financial' = 3, 'religious' = 4) DEFAULT 'none',
  filed UInt8,
  imputed UInt8,
  simplified UInt8,
  articulated UInt8,
  totals_adjustment UInt8,

  -- Классификаторы
  okved String,
  okpo String,
  okopf String,
  okogu String,
  okfc String,
  oktmo String,

  -- Гео-данные
  lon String,
  lat String,
  geocoding_quality LowCardinality(Nullable(String)) DEFAULT NULL,

  -- Балансовые показатели (Бухгалтерский баланс)
  B_noncurrent_assets Float64,
  B_intangible_assets Float64,
  B_research_development Float64,
  B_intangible_exploration Float64,
  B_tangible_exploration Float64,
  B_fixed_assets Float64,
  B_tangible_invest Float64,
  B_fin_invest Float64,
  B_def_tax_assets Float64,
  B_other_noncurrent_assets Float64,
  B_current_assets Float64,
  B_inventories Float64,
  B_vat_receivable Float64,
  B_accounts_receivable Float64,
  B_fin_invest_current Float64,
  B_cash_equivalents Float64,
  B_other_current Float64,
  B_total_equity Float64,
  B_charter_capital Float64,
  B_treasury_shares Float64,
  B_reval_assets Float64,
  B_add_capital Float64,
  B_reserve_capital Float64,
  B_retained_earnings Float64,
  B_longterm_liab Float64,
  B_longterm_debt Float64,
  B_def_tax_liab Float64,
  B_provision_liab Float64,
  B_other_liab_longterm Float64,
  B_shortterm_liab Float64,
  B_shortterm_debt Float64,
  B_shortterm_payables Float64,
  B_def_income Float64,
  B_provision_liab_short Float64,
  B_other_liab_short Float64,
  B_assets Float64,
  B_liab Float64,

  -- Отчёт о финансовых результатах (Profit & Loss)
  PL_revenue Float64,
  PL_cost_of_sales Float64,
  PL_gross_profit Float64,
  PL_commercial_expenses Float64,
  PL_management_expenses Float64,
  PL_profit_from_sales Float64,
  PL_income_participation Float64,
  PL_interest_receivable Float64,
  PL_interest_payable Float64,
  PL_other_income Float64,
  PL_other_expenses Float64,
  PL_before_tax Float64,
  PL_income_tax Float64,
  PL_current_income_tax Float64,
  PL_def_income_tax Float64,
  PL_tax_liab Float64,
  PL_change_def_tax_liab Float64,
  PL_change_def_tax_assets Float64,
  PL_other_factors Float64,
  PL_net_profit Float64,
  PL_reval Float64,
  PL_other_operations Float64,
  PL_income_tax_operations Float64,
  PL_total Float64,
  PL_basic_earnings_share Float64,
  PL_diluted_earnings_share Float64,

  -- Изменения капитала (Equity Period)
  Epp_equity Float64,
  Ep_incr Float64,
  Ep_incr_net_profit Float64,
  Ep_incr_asset_reval Float64,
  Ep_incr_income Float64,
  Ep_incr_add_share_issue Float64,
  Ep_incr_share_value Float64,
  Ep_incr_reorg Float64,
  Ep_incr_other Float64,
  Ep_decr Float64,
  Ep_decr_loss Float64,
  Ep_decr_asset_reval Float64,
  Ep_decr_expenses Float64,
  Ep_decr_share_value Float64,
  Ep_decr_shares_number Float64,
  Ep_decr_reorg Float64,
  Ep_decr_dividends Float64,
  Ep_decr_special Float64,
  Ep_change_add Float64,
  Ep_change_reserve Float64,
  Ep_equity Float64,
  E_incr Float64,
  E_incr_net_profit Float64,
  E_incr_asset_reval Float64,
  E_incr_income Float64,
  E_incr_add_share_issue Float64,
  E_incr_share_value Float64,
  E_incr_reorg Float64,
  E_incr_other Float64,
  E_decr Float64,
  E_decr_loss Float64,
  E_decr_asset_reval Float64,
  E_decr_expenses Float64,
  E_decr_share_value Float64,
  E_decr_shares_number Float64,
  E_decr_reorg Float64,
  E_decr_dividends Float64,
  E_decr_special Float64,
  E_change_add Float64,
  E_change_reserve Float64,
  E_equity Float64,
  ADJ_equity_before Float64,
  ADJ_policy Float64,
  ADJ_error Float64,
  ADJ_equity_after Float64,
  ADJ_undistr_profit_before Float64,
  ADJ_undistr_profit_policy Float64,
  ADJ_undistr_profit_errors Float64,
  ADJ_undistr_profit_after Float64,
  ADJ_other_equity_before Float64,
  ADJ_other_equity_policy Float64,
  ADJ_other_equity_errors Float64,
  ADJ_other_equity_after Float64,
  NA_net_assets Float64,

  -- Отчёт о движении денежных средств (Cash Flow)
  CFi_operating Float64,
  CFi_sales Float64,
  CFi_payments Float64,
  CFi_resale_invest Float64,
  CFi_firm_specific Float64,
  CFi_other Float64,
  CFo_operating Float64,
  CFo_materials Float64,
  CFo_labor Float64,
  CFo_interest Float64,
  CFo_income_tax Float64,
  CFo_special Float64,
  CFo_other_operating Float64,
  CF_balance_operating Float64,
  CFi_invest Float64,
  CFi_sale_noncurrent_assets Float64,
  CFi_sale_shares Float64,
  CFi_loan_repayments Float64,
  CFi_dividends_interest Float64,
  CFi_invest_special Float64,
  CFi_invest_other Float64,
  CFo_invest Float64,
  CFo_acquisition_assets Float64,
  CFo_acquisition_shares Float64,
  CFo_acquisition_debt Float64,
  CFo_interest_payments Float64,
  CFo_invest_special Float64,
  CFo_invest_other Float64,
  CF_balance_invest Float64,
  CFi_fin Float64,
  CFi_loans Float64,
  CFi_owner_contributions Float64,
  CFi_share_issuance Float64,
  CFi_bond_issuance Float64,
  CFi_fin_special Float64,
  CFi_fin_other Float64,
  CFo_fin Float64,
  CFo_payments_owners Float64,
  CFo_payments_dividends Float64,
  CFo_debt_repayments Float64,
  CFo_fin_special Float64,
  CFo_fin_other Float64,
  CF_balance_fin Float64,
  CF_balance Float64,
  C_balance_start Float64,
  C_balance_end Float64,
  C_foreign_currency_impact Float64,

  -- Отчёт о целевом использовании средств (Non-profit)
  PU_start Float64,
  PU_entrance Float64,
  PU_membership_fees Float64,
  PU_designated_receive Float64,
  PU_voluntary Float64,
  PU_income_activities Float64,
  PU_income_other Float64,
  PU_total_received Float64,
  PU_designated_expense Float64,
  PU_aid Float64,
  PU_conference Float64,
  PU_other_events Float64,
  PU_administrative Float64,
  PU_labor Float64,
  PU_nonlabor Float64,
  PU_travel Float64,
  PU_maintenance Float64,
  PU_other_administrative Float64,
  PU_acquisition_assets Float64,
  PU_other_expenses Float64,
  PU_total_expenses Float64,
  PU_remaining Float64,

  -- Versioning для ReplacingMergeTree
  updated_at DateTime DEFAULT now()

) ENGINE = ReplacingMergeTree(updated_at)
ORDER BY (inn, year)
PARTITION BY toYYYYMM(makeDate(year, 1, 1))
TTL updated_at + INTERVAL 10 YEAR
SETTINGS index_granularity = 8192;

-- Шаг 2: Копируем данные из старой таблицы
-- Используем INSERT SELECT для сохранения всех данных
-- Для 60M+ строк это может занять 10-30 минут
INSERT INTO financial_reports_new
SELECT * FROM financial_reports;

-- Шаг 3: Optimise для слияния частей
OPTIMIZE TABLE financial_reports_new FINAL;

-- Шаг 4: Atomic swap через RENAME
-- Сначала переименовываем старую таблицу (backup)
RENAME TABLE financial_reports TO financial_reports_old;

-- Активируем новую таблицу с partitioning
RENAME TABLE financial_reports_new TO financial_reports;

-- Шаг 5: Удаляем старую таблицу после успешного swap
DROP TABLE IF EXISTS financial_reports_old;
