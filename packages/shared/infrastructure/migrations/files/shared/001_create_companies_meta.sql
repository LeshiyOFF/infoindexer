-- ═══════════════════════════════════════════════════════════════════
-- Migration shared/001: Create Base companies_meta Table
-- ═══════════════════════════════════════════════════════════════════
--
-- Architecture Decision:
-- - Базовая версия companies_meta для shared использования
-- - Полная версия создаётся в egrul-sync-worker/003
-- - Используется ReplacingMergeTree для дедупликации
--
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS companies_meta (
  inn String,
  name String DEFAULT '',
  director String DEFAULT '',
  status String DEFAULT '',
  address String DEFAULT '',
  founders Array(String) DEFAULT [],
  sanctions Array(String) DEFAULT [],
  updated_at DateTime DEFAULT now(),
  INDEX name_idx name TYPE tokenbf_v1(4096, 3, 0) GRANULARITY 1,
  INDEX director_idx director TYPE tokenbf_v1(4096, 3, 0) GRANULARITY 1,
  INDEX status_idx status TYPE set(10) GRANULARITY 1
) ENGINE = ReplacingMergeTree(updated_at)
ORDER BY inn
TTL updated_at + INTERVAL 5 YEAR
SETTINGS index_granularity = 8192;
