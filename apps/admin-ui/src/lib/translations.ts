const fieldTranslations: Record<string, string> = {
  // Metadata
  "inn": "ИНН",
  "ogrn": "ОГРН",
  "region": "Регион",
  "region_taxcode": "Код налогового региона",
  "creation_date": "Дата создания",
  "dissolution_date": "Дата ликвидации",
  "age": "Возраст компании",
  "okved": "ОКВЭД",
  "okpo": "ОКПО",
  "okopf": "ОКОПФ",
  "okogu": "ОКОГУ",
  "okfc": "ОКФС",
  "oktmo": "ОКТМО",
  "year": "Год",

  // Balance Sheet (B_)
  "B_assets": "Активы (Всего)",
  "B_liab": "Обязательства (Всего)",
  "B_total_equity": "Капитал и резервы",
  "B_noncurrent_assets": "Внеоборотные активы",
  "B_current_assets": "Оборотные активы",
  "B_fixed_assets": "Основные средства",
  "B_intangible_assets": "Нематериальные активы",
  "B_inventories": "Запасы",
  "B_accounts_receivable": "Дебиторская задолженность",
  "B_cash_equivalents": "Денежные средства",
  "B_shortterm_liab": "Краткосрочные обязательства",
  "B_longterm_liab": "Долгосрочные обязательства",
  "B_shortterm_debt": "Заемные средства (краткоср.)",
  "B_longterm_debt": "Заемные средства (долгоср.)",
  "B_retained_earnings": "Нераспределенная прибыль",
  "B_charter_capital": "Уставный капитал",
  "B_shortterm_payables": "Кредиторская задолженность",

  // Profit and Loss (PL_)
  "PL_revenue": "Выручка",
  "PL_cost_of_sales": "Себестоимость продаж",
  "PL_gross_profit": "Валовая прибыль",
  "PL_profit_from_sales": "Прибыль (убыток) от продаж",
  "PL_before_tax": "Прибыль (убыток) до налогообложения",
  "PL_net_profit": "Чистая прибыль (убыток)",
  "PL_commercial_expenses": "Коммерческие расходы",
  "PL_management_expenses": "Управленческие расходы",
  "PL_other_income": "Прочие доходы",
  "PL_other_expenses": "Прочие расходы",
  "PL_income_tax": "Налог на прибыль",

  // Cash Flow (CF_)
  "CFi_operating": "Поступления от текущих операций",
  "CFo_operating": "Платежи по текущим операциям",
  "CF_balance_operating": "Сальдо денежных потоков от текущих операций",
  "CFi_invest": "Поступления от инвестиционных операций",
  "CFo_invest": "Платежи по инвестиционным операциям",
  "CFi_fin": "Поступления от финансовых операций",
  "CFo_fin": "Платежи по финансовым операциям",
  "C_balance_start": "Остаток средств на начало года",
  "C_balance_end": "Остаток средств на конец года",

  // Purpose (PU_)
  "PU_total_received": "Всего поступило средств",
  "PU_total_expenses": "Всего использовано средств",
  "PU_remaining": "Остаток средств на конец периода"
};

export const translateField = (key: string): string => {
  if (fieldTranslations[key]) return fieldTranslations[key];
  
  // Clean up common prefixes for untranslated fields
  let clean = key.replace(/^(B_|PL_|CF_|CFi_|CFo_|PU_|ADJ_|Ep_|Epp_|E_)/, '');
  clean = clean.replace(/_/g, ' ');
  return clean.charAt(0).toUpperCase() + clean.slice(1);
};
