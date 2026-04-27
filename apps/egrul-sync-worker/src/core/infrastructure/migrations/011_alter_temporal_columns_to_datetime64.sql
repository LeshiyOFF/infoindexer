-- Migration 011: Convert temporal columns to DateTime64(3, 'UTC')
-- Purpose: Support millisecond precision and explicit UTC timezone
-- Architecture: DateTime64 stored as Unix timestamp (ms), formatted from Date.getTime()
-- Scope: Only persons_raw and companies_raw have temporal columns

-- Convert persons_raw temporal columns
ALTER TABLE egrul_persons_raw
MODIFY COLUMN first_seen DateTime64(3, 'UTC'),
MODIFY COLUMN last_changed DateTime64(3, 'UTC');

-- Convert companies_raw temporal columns
ALTER TABLE egrul_companies_raw
MODIFY COLUMN first_seen DateTime64(3, 'UTC'),
MODIFY COLUMN last_changed DateTime64(3, 'UTC');
