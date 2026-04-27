-- Migration 003: Create companies_meta table
-- Purpose: Хранит агрегированные метаданные о компаниях EGRUL
-- Architecture: ReplacingMergeTree with TTL for auto-cleanup

CREATE TABLE IF NOT EXISTS companies_meta (
  -- Primary key
  inn String,

  -- Company data
  name String,
  director String,
  status String,
  address String,

  -- Arrays for related data
  founders Array(String),
  sanctions Array(String),

  -- Metadata
  updated_at DateTime DEFAULT now(),

  -- Indexes for fast search
  INDEX name_idx name TYPE tokenbf_v1(4096, 3, 0) GRANULARITY 1,
  INDEX director_idx director TYPE tokenbf_v1(4096, 3, 0) GRANULARITY 1,
  INDEX status_idx status TYPE set(10) GRANULARITY 1
) ENGINE = ReplacingMergeTree(updated_at)
ORDER BY inn
TTL updated_at + INTERVAL 5 YEAR
SETTINGS index_granularity = 8192;

-- Add indexes if table existed without them
ALTER TABLE companies_meta ADD INDEX IF NOT EXISTS name_idx name TYPE tokenbf_v1(4096, 3, 0) GRANULARITY 1;
ALTER TABLE companies_meta ADD INDEX IF NOT EXISTS director_idx director TYPE tokenbf_v1(4096, 3, 0) GRANULARITY 1;
ALTER TABLE companies_meta ADD INDEX IF NOT EXISTS status_idx status TYPE set(10) GRANULARITY 1;
