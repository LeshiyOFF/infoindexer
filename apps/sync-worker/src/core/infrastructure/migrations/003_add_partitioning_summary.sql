-- Migration: Partitioning для financial_reports_summary
-- Description: Добавление PARTITION BY для быстрого удаления данных по годам
-- Version: 003
-- Author: InfoIndexer Team
-- Date: 2026-04-21
--
-- Success Criteria:
-- - PARTITION BY добавлен
-- - DROP PARTITION занимает < 1 секунды
-- - Данные сохранены
--
-- Architecture:
-- - Strategy: Recreate table через RENAME для zero-downtime
-- - Partition key: toYYYYMM(makeDate(latest_year, 1, 1))
-- - Одна партиция в год для yearly aggregated data
--
-- ClickHouse Notes:
-- - ALTER TABLE ... MODIFY PARTITION BY не поддерживается
-- - Используем RENAME TABLE для atomic swap
-- - toYYYYMM — стандартная практика для time-series данных

-- Шаг 1: Создаём новую таблицу с partitioning
CREATE TABLE IF NOT EXISTS financial_reports_summary_new (
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
TTL updated_at + INTERVAL 5 YEAR;

-- Шаг 2: Копируем данные из старой таблицы
-- Используем INSERT SELECT для сохранения всех данных
INSERT INTO financial_reports_summary_new
SELECT
  inn,
  ogrn,
  region,
  latest_year,
  records_count,
  lon,
  lat,
  has_geo,
  revenue,
  net_profit,
  charter_capital,
  age,
  has_director,
  has_name,
  name,
  director,
  status,
  okved,
  updated_at
FROM financial_reports_summary;

-- Шаг 3: Optimise для слияния частей
OPTIMIZE TABLE financial_reports_summary_new FINAL;

-- Шаг 4: Atomic swap через RENAME
-- Сначала переименовываем старую таблицу (backup)
RENAME TABLE financial_reports_summary TO financial_reports_summary_old;

-- Активируем новую таблицу с partitioning
RENAME TABLE financial_reports_summary_new TO financial_reports_summary;

-- Шаг 5: Удаляем старую таблицу после успешного swap
DROP TABLE IF EXISTS financial_reports_summary_old;
