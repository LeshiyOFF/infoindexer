-- Migration: Create company_sanctions table
-- Description: Хранит санкции наложенные на компании
-- Engine: ReplacingMergeTree для автоматической дедупликации

CREATE TABLE IF NOT EXISTS company_sanctions (
  -- Первичный ключ
  id String,

  -- Идентификатор компании
  inn String,

  -- Данные о санкции
  program String,
  program_id String,
  authority String,
  country String,

  -- Период действия
  start_date Date,
  end_date Nullable(Date),

  -- Источник данных
  source_url String,

  -- Метаданные
  created_at DateTime DEFAULT now(),
  updated_at DateTime DEFAULT now(),

  -- Индексы для быстрого поиска
  INDEX inn_idx inn TYPE bloom_filter GRANULARITY 1,
  INDEX program_idx program TYPE bloom_filter GRANULARITY 1,
  INDEX country_idx country TYPE set(20) GRANULARITY 1,
  INDEX authority_idx authority TYPE tokenbf_v1(4096, 3, 0) GRANULARITY 1
) ENGINE = ReplacingMergeTree(updated_at)
ORDER BY (inn, id)
TTL updated_at + INTERVAL 5 YEAR
SETTINGS index_granularity = 8192;
