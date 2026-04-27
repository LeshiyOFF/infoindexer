-- Migration 005: Create identity_mapping table
-- Purpose: Хранит маппинг идентификаторов сущностей из разных источников
-- Architecture: ReplacingMergeTree with TTL for auto-cleanup

CREATE TABLE IF NOT EXISTS egrul_identity_mapping (
  -- Mapping key
  id_type String,
  raw_id String,

  -- Canonical identifier
  canonical_id String,

  -- Metadata
  entity_type String,
  source String,
  confidence Float32,

  -- Timestamps
  created_at DateTime,
  updated_at DateTime
) ENGINE = ReplacingMergeTree(updated_at)
ORDER BY (id_type, raw_id)
TTL updated_at + INTERVAL 5 YEAR
SETTINGS index_granularity = 8192;
