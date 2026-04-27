-- Migration 004: Create EGRUL raw tables for import
-- Purpose: Временные таблицы для импорта EGRUL данных перед обработкой
-- Architecture: MergeTree для быстрой вставки

-- Companies raw table
CREATE TABLE IF NOT EXISTS egrul_companies_raw (
  id String,
  inn String,
  name String,
  status String,
  address String
) ENGINE = MergeTree()
ORDER BY id
SETTINGS index_granularity = 8192;

-- Persons raw table
CREATE TABLE IF NOT EXISTS egrul_persons_raw (
  id String,
  name String,
  first_name String,
  last_name String,
  father_name String
) ENGINE = MergeTree()
ORDER BY id
SETTINGS index_granularity = 8192;

-- Directorships raw table
CREATE TABLE IF NOT EXISTS egrul_directorships_raw (
  id String,
  organization_id String,
  director_id String,
  role String,
  start_date Date,
  end_date Nullable(Date)
) ENGINE = MergeTree()
ORDER BY id
SETTINGS index_granularity = 8192;

-- Ownerships raw table
CREATE TABLE IF NOT EXISTS egrul_ownerships_raw (
  id String,
  owner_id String,
  asset_id String,
  percentage String,
  shares_count String,
  start_date Date,
  end_date Nullable(Date)
) ENGINE = MergeTree()
ORDER BY id
SETTINGS index_granularity = 8192;
