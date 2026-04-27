"use strict";
/**
 * Утилита для конвертации типов колонок
 *
 * @remarks
 * Конвертирует DuckDB типы в ClickHouse типы.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColumnTypeUtil = void 0;
/**
 * Колонки для LowCardinality оптимизации
 */
const LOW_CARDINALITY_COLUMNS = [
    'okved2', 'region', 'inn', 'kpp', 'region_taxcode',
    'okpo', 'okopf', 'okfs', 'okato', 'oktmo'
];
/**
 * Все известные колонки financial_reports
 * Используется для фильтрации неизвестных полей из Parquet
 */
const KNOWN_FINANCIAL_REPORTS_COLUMNS = new Set([
    // Primary keys
    'inn', 'year',
    // Metadata
    'ogrn', 'region', 'region_taxcode', 'creation_date', 'dissolution_date', 'age',
    // Flags
    'eligible', 'filed', 'imputed', 'simplified', 'articulated', 'totals_adjustment',
    // Exemption criteria
    'exemption_criteria',
    // Classifiers
    'okved', 'okved_section', 'okpo', 'okopf', 'okogu', 'okfc', 'oktmo',
    // Geo data
    'lon', 'lat', 'geocoding_quality',
    // Balance sheet (B_*)
    'B_noncurrent_assets', 'B_intangible_assets', 'B_research_development',
    'B_intangible_exploration', 'B_tangible_exploration', 'B_fixed_assets',
    'B_tangible_invest', 'B_fin_invest', 'B_def_tax_assets', 'B_other_noncurrent_assets',
    'B_current_assets', 'B_inventories', 'B_vat_receivable', 'B_accounts_receivable',
    'B_fin_invest_current', 'B_cash_equivalents', 'B_other_current',
    'B_total_equity', 'B_charter_capital', 'B_treasury_shares', 'B_reval_assets',
    'B_add_capital', 'B_reserve_capital', 'B_retained_earnings',
    'B_longterm_liab', 'B_longterm_debt', 'B_def_tax_liab', 'B_provision_liab',
    'B_other_liab_longterm', 'B_shortterm_liab', 'B_shortterm_debt',
    'B_shortterm_payables', 'B_def_income', 'B_provision_liab_short',
    'B_other_liab_short', 'B_assets', 'B_liab',
    // Profit & Loss (PL_*)
    'PL_revenue', 'PL_cost_of_sales', 'PL_gross_profit', 'PL_commercial_expenses',
    'PL_management_expenses', 'PL_profit_from_sales', 'PL_income_participation',
    'PL_interest_receivable', 'PL_interest_payable', 'PL_other_income',
    'PL_other_expenses', 'PL_before_tax', 'PL_income_tax', 'PL_current_income_tax',
    'PL_def_income_tax', 'PL_tax_liab', 'PL_change_def_tax_liab',
    'PL_change_def_tax_assets', 'PL_other_factors', 'PL_net_profit', 'PL_reval',
    'PL_other_operations', 'PL_income_tax_operations', 'PL_total',
    'PL_basic_earnings_share', 'PL_diluted_earnings_share',
    // Equity Period (Ep_*, Epp_*, E_*, ADJ_*, NA_*)
    'Epp_equity', 'Ep_incr', 'Ep_incr_net_profit', 'Ep_incr_asset_reval',
    'Ep_incr_income', 'Ep_incr_add_share_issue', 'Ep_incr_share_value',
    'Ep_incr_reorg', 'Ep_incr_other', 'Ep_decr', 'Ep_decr_loss',
    'Ep_decr_asset_reval', 'Ep_decr_expenses', 'Ep_decr_share_value',
    'Ep_decr_shares_number', 'Ep_decr_reorg', 'Ep_decr_dividends',
    'Ep_decr_special', 'Ep_change_add', 'Ep_change_reserve', 'Ep_equity',
    'E_incr', 'E_incr_net_profit', 'E_incr_asset_reval', 'E_incr_income',
    'E_incr_add_share_issue', 'E_incr_share_value', 'E_incr_reorg', 'E_incr_other',
    'E_decr', 'E_decr_loss', 'E_decr_asset_reval', 'E_decr_expenses',
    'E_decr_share_value', 'E_decr_shares_number', 'E_decr_reorg', 'E_decr_dividends',
    'E_decr_special', 'E_change_add', 'E_change_reserve', 'E_equity',
    'ADJ_equity_before', 'ADJ_policy', 'ADJ_error', 'ADJ_equity_after',
    'ADJ_undistr_profit_before', 'ADJ_undistr_profit_policy', 'ADJ_undistr_profit_errors',
    'ADJ_undistr_profit_after', 'ADJ_other_equity_before', 'ADJ_other_equity_policy',
    'ADJ_other_equity_errors', 'ADJ_other_equity_after', 'NA_net_assets',
    // Cash Flow (CFi_*, CFo_*, C_balance_*, C_*, C_foreign_currency_impact)
    'CFi_operating', 'CFi_sales', 'CFi_payments', 'CFi_resale_invest',
    'CFi_firm_specific', 'CFi_other', 'CFo_operating', 'CFo_materials',
    'CFo_labor', 'CFo_interest', 'CFo_income_tax', 'CFo_special',
    'CFo_other_operating', 'CF_balance_operating', 'CFi_invest', 'CFi_sale_noncurrent_assets',
    'CFi_sale_shares', 'CFi_loan_repayments', 'CFi_dividends_interest',
    'CFi_invest_special', 'CFi_invest_other', 'CFo_invest', 'CFo_acquisition_assets',
    'CFo_acquisition_shares', 'CFo_acquisition_debt', 'CFo_interest_payments',
    'CFo_invest_special', 'CFo_invest_other', 'CF_balance_invest',
    'CFi_fin', 'CFi_loans', 'CFi_owner_contributions', 'CFi_share_issuance',
    'CFi_bond_issuance', 'CFi_fin_special', 'CFi_fin_other', 'CFo_fin',
    'CFo_payments_owners', 'CFo_payments_dividends', 'CFo_debt_repayments',
    'CFo_fin_special', 'CFo_fin_other', 'CF_balance_fin', 'CF_balance',
    'C_balance_start', 'C_balance_end', 'C_foreign_currency_impact',
    // Non-profit (PU_*)
    'PU_start', 'PU_entrance', 'PU_membership_fees', 'PU_designated_receive',
    'PU_voluntary', 'PU_income_activities', 'PU_income_other', 'PU_total_received',
    'PU_designated_expense', 'PU_aid', 'PU_conference', 'PU_other_events',
    'PU_administrative', 'PU_labor', 'PU_nonlabor', 'PU_travel',
    'PU_maintenance', 'PU_other_administrative', 'PU_acquisition_assets',
    'PU_other_expenses', 'PU_total_expenses', 'PU_remaining',
    // Versioning
    'updated_at'
]);
/**
 * Утилита для конвертации типов колонок
 */
class ColumnTypeUtil {
    /**
     * Получает ClickHouse тип из DuckDB типа
     */
    getClickHouseType(duckdbType, columnName) {
        const baseType = this.mapDuckDbTypeToClickHouse(duckdbType);
        if (LOW_CARDINALITY_COLUMNS.includes(columnName) && baseType === 'String') {
            return 'LowCardinality(String)';
        }
        return `Nullable(${baseType})`;
    }
    /**
     * Создаёт описание колонки
     */
    createColumnDescription(name, duckdbType) {
        return {
            name,
            duckdbType,
            clickhouseType: this.getClickHouseType(duckdbType, name)
        };
    }
    /**
     * Получает множество известных колонок financial_reports
     *
     * @remarks
     * Используется для фильтрации неизвестных полей из Parquet.
     * Поля которых нет в схеме (financial, outlier и т.д.) игнорируются.
     */
    getKnownColumns() {
        return KNOWN_FINANCIAL_REPORTS_COLUMNS;
    }
    /**
     * Преобразует DuckDB тип в базовый ClickHouse тип
     */
    mapDuckDbTypeToClickHouse(duckdbType) {
        if (duckdbType.includes('VARCHAR'))
            return 'String';
        if (duckdbType.includes('BIGINT'))
            return 'Int64';
        if (duckdbType.includes('INTEGER'))
            return 'Int32';
        if (duckdbType.includes('DOUBLE'))
            return 'Float64';
        if (duckdbType.includes('FLOAT'))
            return 'Float32';
        if (duckdbType.includes('BOOLEAN'))
            return 'UInt8';
        if (duckdbType.includes('DATE'))
            return 'Date';
        if (duckdbType.includes('TIMESTAMP'))
            return 'DateTime';
        return 'String';
    }
}
exports.ColumnTypeUtil = ColumnTypeUtil;
