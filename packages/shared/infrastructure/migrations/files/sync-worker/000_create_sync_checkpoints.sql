-- Migration: Create sync_checkpoints table
-- Description: Чекпоинты для resume синхронизации financial_reports
-- Engine: ReplacingMergeTree для автоматической дедупликации
-- TTL: 30 дней для автоочистки устаревших чекпоинтов

CREATE TABLE IF NOT EXISTS sync_checkpoints (
  -- Первичный ключ: год синхронизации
  year UInt16,

  -- Данные прогресса
  processedRows UInt64,
  percentage Float32,
  checksum String,

  -- Метаданные
  timestamp DateTime64(3),
  updated_at DateTime DEFAULT now()

) ENGINE = ReplacingMergeTree(updated_at)
ORDER BY (year, timestamp)
TTL updated_at + INTERVAL 30 DAY
SETTINGS index_granularity = 8192;
