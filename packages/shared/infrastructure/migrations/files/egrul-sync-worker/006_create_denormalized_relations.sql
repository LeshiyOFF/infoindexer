-- Migration 006: Create denormalized relations tables
-- Purpose: Pre-aggregated данные о директорах и владельцах с нормализованным INN
-- Architecture: MergeTree для быстрой вставки и чтения
-- Performance: Eliminates replaceAll() from JOINs, prevents cartesian blowup

-- Директора с нормализованным INN
-- replaceAll() выполняется один раз при вставке, не при каждом JOIN
CREATE TABLE IF NOT EXISTS egrul_directors_denormalized (
  -- Нормализованный INN (pre-computed)
  inn String,

  -- Данные директора
  director_name String,
  role String,

  -- Индекс для быстрого поиска
  INDEX inn_idx inn TYPE bloom_filter GRANULARITY 1
) ENGINE = MergeTree()
ORDER BY inn
SETTINGS index_granularity = 8192;

-- Владельцы с нормализованным INN
-- replaceAll() выполняется один раз при вставке, не при каждом JOIN
CREATE TABLE IF NOT EXISTS egrul_founders_denormalized (
  -- Нормализованный INN (pre-computed)
  inn String,

  -- Данные владельца
  founder_name String,
  percentage String,

  -- Индекс для быстрого поиска
  INDEX inn_idx inn TYPE bloom_filter GRANULARITY 1
) ENGINE = MergeTree()
ORDER BY inn
SETTINGS index_granularity = 8192;
