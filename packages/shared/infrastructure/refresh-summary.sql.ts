/**
 * SQL Constants для Refresh Summary
 *
 * @remarks
 * Infrastructure Layer: SQL запросы для refresh.
 * Вынесены в отдельный файл для соблюдения лимита 200 строк.
 */

/** Имя целевой таблицы */
export const TARGET_TABLE = 'financial_reports_summary';

/** SQL для создания таблицы (с параметризованным именем) */
export const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS {table:Identifier} (
    inn String,
    ogrn String,
    region String,
    latest_year UInt16,
    records_count UInt64,
    lon String,
    lat String,
    has_geo UInt8,
    revenue Float64,
    net_profit Float64,
    charter_capital Float64,
    age Float32,
    has_director UInt8,
    has_name UInt8,
    name String,
    director String,
    status String,
    okved String,
    updated_at DateTime DEFAULT now(),
    PROJECTION by_region (SELECT * ORDER BY (region, -revenue, inn)),
    PROJECTION by_age (SELECT * ORDER BY (age, -revenue, inn)),
    PROJECTION by_has_director (SELECT * ORDER BY (has_director, -revenue, inn)),
    PROJECTION by_has_name (SELECT * ORDER BY (has_name, -revenue, inn)),
    PROJECTION by_has_geo (SELECT * ORDER BY (has_geo, -revenue, inn)),
    PROJECTION by_records_count (SELECT * ORDER BY (records_count, -revenue, inn)),
    PROJECTION by_records_count_desc (SELECT * ORDER BY (-records_count, -revenue, inn)),
    PROJECTION by_status (SELECT * ORDER BY (status, -revenue, inn)),
    INDEX idx_name_ngram name TYPE ngrambf_v1(4, 256, 2, 0) GRANULARITY 4
  ) ENGINE = MergeTree()
  ORDER BY (-revenue, inn)
  PARTITION BY toYYYYMM(makeDate(latest_year, 1, 1))
  TTL max(updated_at) + INTERVAL 5 YEAR
  DELETE ON TTL expired
`;

/** SQL для заполнения таблицы данными (с параметризованным именем) */
export const POPULATE_SQL = `
  INSERT INTO {table:Identifier}
  SELECT
    fr.inn,
    fr.ogrn,
    fr.region,
    fr.latest_year,
    fr.records_count,
    fr.lon,
    fr.lat,
    fr.has_geo,
    fr.revenue,
    fr.net_profit,
    fr.charter_capital,
    fr.age,
    fr.has_director,
    fr.has_name,
    fr.name,
    fr.director,
    fr.status,
    fr.okved,
    now() as updated_at
  FROM (
    SELECT
      inn,
      toString(argMax(ogrn, year)) as ogrn,
      toString(argMax(region, year)) as region,
      toUInt16(max(year)) as latest_year,
      toUInt64(count()) as records_count,
      toString(argMax(lon, year)) as lon,
      toString(argMax(lat, year)) as lat,
      if((argMax(lon, year) != '' AND argMax(lat, year) != ''), 1, 0) as has_geo,
      toFloat64OrZero(toString(argMax(PL_revenue, year))) as revenue,
      toFloat64OrZero(toString(argMax(PL_net_profit, year))) as net_profit,
      toFloat64OrZero(toString(argMax(B_charter_capital, year))) as charter_capital,
      toFloat32OrZero(toString(argMax(age, year))) as age,
      toString(argMax(okved, year)) as okved
    FROM financial_reports
    GROUP BY inn
  ) fr
  LEFT JOIN (
    SELECT
      inn,
      argMax(director, updated_at) as director,
      argMax(name, updated_at) as name,
      argMax(status, updated_at) as status
    FROM companies_meta
    GROUP BY inn
  ) cm ON fr.inn = cm.inn
`;

/** SQL для оптимизации */
export const OPTIMIZE_SQL = 'OPTIMIZE TABLE {table:Identifier} FINAL';

/** SQL для подсчёта строк */
export const COUNT_SQL = 'SELECT count() as c FROM {table:Identifier}';
