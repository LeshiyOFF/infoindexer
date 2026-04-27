-- Migration 001: Create resume_states table
-- Purpose: Store HTTP download state for Range resume support
-- Architecture: ReplacingMergeTree with TTL for auto-cleanup

CREATE TABLE IF NOT EXISTS resume_states (
  -- URL as primary key for identifying download
  url String,

  -- Download progress
  downloadedBytes UInt64,
  totalBytes UInt64,

  -- Validation headers (RFC 7232)
  etag String,
  lastModified String,

  -- Metadata
  timestamp DateTime64(3),
  updated_at DateTime DEFAULT now()

) ENGINE = ReplacingMergeTree(updated_at)
ORDER BY (url, timestamp)
TTL updated_at + INTERVAL 30 DAY
SETTINGS index_granularity = 8192;

-- Create index for faster URL lookups
-- Note: Skip index is more efficient for this use case
