-- Migration: ReplacingMergeTree для financial_reports
-- Description: Дедупликация записей через ReplacingMergeTree с versioning по updated_at
-- Version: 001
-- Author: InfoIndexer Team
-- Date: 2026-04-21
-- Updated: 2026-04-21 (Added PARTITION BY)
--
-- Success Criteria:
-- - Повторная вставка не создаёт дубликаты
-- - FINAL запрос возвращает уникальные записи
-- - updated_at используется для versioning
-- - DROP PARTITION занимает < 1 секунды
--
-- Architecture:
-- - Engine: ReplacingMergeTree(updated_at) - автоматически удаляет дубликаты
-- - Order Key: (inn, year) - уникальность бизнес-записи
-- - Version: updated_at - последняя запись побеждает
-- - Partition Key: toYYYYMM(makeDate(year, 1, 1)) - быстрое DELETE по годам

-- Создаём таблицу с ReplacingMergeTree引擎
CREATE TABLE IF NOT EXISTS financial_reports (
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
  B_noncurrent_assets Float64,        -- line_1100
  B_intangible_assets Float64,        -- line_1110
  B_research_development Float64,     -- line_1120
  B_intangible_exploration Float64,   -- line_1130
  B_tangible_exploration Float64,     -- line_1140
  B_fixed_assets Float64,             -- line_1150
  B_tangible_invest Float64,          -- line_1160
  B_fin_invest Float64,               -- line_1170
  B_def_tax_assets Float64,           -- line_1180
  B_other_noncurrent_assets Float64,  -- line_1190
  B_current_assets Float64,           -- line_1200
  B_inventories Float64,              -- line_1210
  B_vat_receivable Float64,           -- line_1220
  B_accounts_receivable Float64,      -- line_1230
  B_fin_invest_current Float64,       -- line_1240
  B_cash_equivalents Float64,         -- line_1250
  B_other_current Float64,            -- line_1260
  B_total_equity Float64,             -- line_1300
  B_charter_capital Float64,          -- line_1310
  B_treasury_shares Float64,          -- line_1320
  B_reval_assets Float64,             -- line_1340
  B_add_capital Float64,              -- line_1350
  B_reserve_capital Float64,          -- line_1360
  B_retained_earnings Float64,        -- line_1370
  B_longterm_liab Float64,            -- line_1400
  B_longterm_debt Float64,            -- line_1410
  B_def_tax_liab Float64,             -- line_1420
  B_provision_liab Float64,           -- line_1430
  B_other_liab_longterm Float64,      -- line_1450
  B_shortterm_liab Float64,           -- line_1500
  B_shortterm_debt Float64,           -- line_1510
  B_shortterm_payables Float64,       -- line_1520
  B_def_income Float64,               -- line_1530
  B_provision_liab_short Float64,     -- line_1540
  B_other_liab_short Float64,         -- line_1550
  B_assets Float64,                   -- line_1600
  B_liab Float64,                     -- line_1700

  -- Отчёт о финансовых результатах (Profit & Loss)
  PL_revenue Float64,                 -- line_2110
  PL_cost_of_sales Float64,           -- line_2120
  PL_gross_profit Float64,            -- line_2100
  PL_commercial_expenses Float64,     -- line_2210
  PL_management_expenses Float64,     -- line_2220
  PL_profit_from_sales Float64,       -- line_2200
  PL_income_participation Float64,    -- line_2310
  PL_interest_receivable Float64,     -- line_2320
  PL_interest_payable Float64,        -- line_2330
  PL_other_income Float64,            -- line_2340
  PL_other_expenses Float64,          -- line_2350
  PL_before_tax Float64,              -- line_2300
  PL_income_tax Float64,              -- line_2410
  PL_current_income_tax Float64,      -- line_2411
  PL_def_income_tax Float64,          -- line_2412
  PL_tax_liab Float64,                -- line_2421
  PL_change_def_tax_liab Float64,     -- line_2430
  PL_change_def_tax_assets Float64,   -- line_2450
  PL_other_factors Float64,           -- line_2460
  PL_net_profit Float64,              -- line_2400
  PL_reval Float64,                   -- line_2510
  PL_other_operations Float64,        -- line_2520
  PL_income_tax_operations Float64,   -- line_2530
  PL_total Float64,                   -- line_2500
  PL_basic_earnings_share Float64,    -- line_2900
  PL_diluted_earnings_share Float64,  -- line_2910

  -- Изменения капитала (Equity Period)
  Epp_equity Float64,                 -- line_3100
  Ep_incr Float64,                    -- line_3210
  Ep_incr_net_profit Float64,         -- line_3211
  Ep_incr_asset_reval Float64,        -- line_3212
  Ep_incr_income Float64,             -- line_3213
  Ep_incr_add_share_issue Float64,    -- line_3214
  Ep_incr_share_value Float64,        -- line_3215
  Ep_incr_reorg Float64,              -- line_3216
  Ep_incr_other Float64,              -- line_321x
  Ep_decr Float64,                    -- line_3220
  Ep_decr_loss Float64,               -- line_3221
  Ep_decr_asset_reval Float64,        -- line_3222
  Ep_decr_expenses Float64,           -- line_3223
  Ep_decr_share_value Float64,        -- line_3224
  Ep_decr_shares_number Float64,      -- line_3225
  Ep_decr_reorg Float64,              -- line_3226
  Ep_decr_dividends Float64,          -- line_3227
  Ep_decr_special Float64,            -- line_322x
  Ep_change_add Float64,              -- line_3230
  Ep_change_reserve Float64,          -- line_3240
  Ep_equity Float64,                  -- line_3200
  E_incr Float64,                     -- line_3310
  E_incr_net_profit Float64,          -- line_3311
  E_incr_asset_reval Float64,         -- line_3312
  E_incr_income Float64,              -- line_3313
  E_incr_add_share_issue Float64,     -- line_3314
  E_incr_share_value Float64,         -- line_3315
  E_incr_reorg Float64,               -- line_3316
  E_incr_other Float64,               -- line_331x
  E_decr Float64,                     -- line_3320
  E_decr_loss Float64,                -- line_3321
  E_decr_asset_reval Float64,         -- line_3322
  E_decr_expenses Float64,            -- line_3323
  E_decr_share_value Float64,         -- line_3324
  E_decr_shares_number Float64,       -- line_3325
  E_decr_reorg Float64,               -- line_3326
  E_decr_dividends Float64,           -- line_3327
  E_decr_special Float64,             -- line_332x
  E_change_add Float64,               -- line_3330
  E_change_reserve Float64,           -- line_3340
  E_equity Float64,                   -- line_3300
  ADJ_equity_before Float64,          -- line_3400
  ADJ_policy Float64,                 -- line_3410
  ADJ_error Float64,                  -- line_3420
  ADJ_equity_after Float64,           -- line_3500
  ADJ_undistr_profit_before Float64,  -- line_3401
  ADJ_undistr_profit_policy Float64,  -- line_3411
  ADJ_undistr_profit_errors Float64,  -- line_3421
  ADJ_undistr_profit_after Float64,   -- line_3501
  ADJ_other_equity_before Float64,    -- line_3402
  ADJ_other_equity_policy Float64,    -- line_3412
  ADJ_other_equity_errors Float64,    -- line_3422
  ADJ_other_equity_after Float64,     -- line_3502
  NA_net_assets Float64,              -- line_3600

  -- Отчёт о движении денежных средств (Cash Flow)
  CFi_operating Float64,              -- line_4110
  CFi_sales Float64,                  -- line_4111
  CFi_payments Float64,               -- line_4112
  CFi_resale_invest Float64,          -- line_4113
  CFi_firm_specific Float64,          -- line_411x
  CFi_other Float64,                  -- line_4119
  CFo_operating Float64,              -- line_4120
  CFo_materials Float64,              -- line_4121
  CFo_labor Float64,                  -- line_4122
  CFo_interest Float64,               -- line_4123
  CFo_income_tax Float64,             -- line_4124
  CFo_special Float64,                -- line_412x
  CFo_other_operating Float64,        -- line_4129
  CF_balance_operating Float64,       -- line_4100
  CFi_invest Float64,                 -- line_4210
  CFi_sale_noncurrent_assets Float64, -- line_4211
  CFi_sale_shares Float64,            -- line_4212
  CFi_loan_repayments Float64,        -- line_4213
  CFi_dividends_interest Float64,     -- line_4214
  CFi_invest_special Float64,         -- line_421x
  CFi_invest_other Float64,           -- line_4219
  CFo_invest Float64,                 -- line_4220
  CFo_acquisition_assets Float64,     -- line_4221
  CFo_acquisition_shares Float64,     -- line_4222
  CFo_acquisition_debt Float64,       -- line_4223
  CFo_interest_payments Float64,      -- line_4224
  CFo_invest_special Float64,         -- line_422x
  CFo_invest_other Float64,           -- line_4229
  CF_balance_invest Float64,          -- line_4200
  CFi_fin Float64,                    -- line_4310
  CFi_loans Float64,                  -- line_4311
  CFi_owner_contributions Float64,    -- line_4312
  CFi_share_issuance Float64,         -- line_4313
  CFi_bond_issuance Float64,          -- line_4314
  CFi_fin_special Float64,            -- line_431x
  CFi_fin_other Float64,              -- line_4319
  CFo_fin Float64,                    -- line_4320
  CFo_payments_owners Float64,        -- line_4321
  CFo_payments_dividends Float64,     -- line_4322
  CFo_debt_repayments Float64,        -- line_4323
  CFo_fin_special Float64,            -- line_432x
  CFo_fin_other Float64,              -- line_4329
  CF_balance_fin Float64,             -- line_4300
  CF_balance Float64,                 -- line_4400
  C_balance_start Float64,            -- line_4450
  C_balance_end Float64,              -- line_4500
  C_foreign_currency_impact Float64,  -- line_4490

  -- Отчёт о целевом использовании средств (Non-profit)
  PU_start Float64,                   -- line_6100
  PU_entrance Float64,                -- line_6210
  PU_membership_fees Float64,         -- line_6215
  PU_designated_receive Float64,      -- line_6220
  PU_voluntary Float64,              -- line_6230
  PU_income_activities Float64,       -- line_6240
  PU_income_other Float64,            -- line_6250
  PU_total_received Float64,          -- line_6200
  PU_designated_expense Float64,      -- line_6310
  PU_aid Float64,                     -- line_6311
  PU_conference Float64,              -- line_6312
  PU_other_events Float64,            -- line_6313
  PU_administrative Float64,          -- line_6320
  PU_labor Float64,                   -- line_6321
  PU_nonlabor Float64,                -- line_6322
  PU_travel Float64,                  -- line_6323
  PU_maintenance Float64,             -- line_6324
  PU_other_administrative Float64,    -- line_6326
  PU_acquisition_assets Float64,      -- line_6330
  PU_other_expenses Float64,          -- line_6350
  PU_total_expenses Float64,          -- line_6300
  PU_remaining Float64,               -- line_6400

  -- Versioning для ReplacingMergeTree
  updated_at DateTime DEFAULT now()

) ENGINE = ReplacingMergeTree(updated_at)
ORDER BY (inn, year)
PARTITION BY toYYYYMM(makeDate(year, 1, 1))
TTL updated_at + INTERVAL 10 YEAR
SETTINGS index_granularity = 8192;
