-- Migration 005: exemption_criteria Enum8
-- Description: Convert exemption_criteria from UInt8 to Enum8 для type safety
-- Version: 005
-- Author: InfoIndexer Team
-- Date: 2026-04-22
--
-- Success Criteria:
-- - exemption_criteria хранится как Enum8 (1 byte)
-- - SELECT возвращает строковые значения ("none", "initiated", etc.)
-- - Type safety: невалидные значения rejected at insert
--
-- Architecture:
-- - Direct ALTER TABLE (table is empty, 0 rows)
-- - Enum8 соответствует ClickHouse best practices
-- - Values: 'none'=0, 'initiated'=1, 'state'=2, 'financial'=3, 'religious'=4
--
-- Data Source: RFSD Parquet (https://huggingface.co/datasets/irlspbru/RFSD)
-- Distribution (2024):
--   none: 3,145,286 (99.4%)
--   initiated: 17,258
--   state: 7,484
--   financial: 488
--   religious: 44

ALTER TABLE financial_reports
MODIFY COLUMN exemption_criteria
Enum8('none' = 0, 'initiated' = 1, 'state' = 2, 'financial' = 3, 'religious' = 4)
DEFAULT 'none';
