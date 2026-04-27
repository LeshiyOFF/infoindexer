-- Migration 006: Change geocoding_quality from UInt8 to LowCardinality(Nullable(String))
--
-- @remarks
-- Problem: geocoding_quality was defined as UInt8 in schema, but Parquet data contains
-- string values: 'house', 'street', 'city', NULL. This caused parsing error:
-- "Cannot parse input: expected '"' before: 'house'"
--
-- Solution: Change to LowCardinality(Nullable(String)) to match actual data.
--
-- Data source: RFSD Parquet files on HuggingFace
-- Schema analysis shows VARCHAR type with values:
-- - street: ~51%
-- - house: ~38%
-- - city: ~9%
-- - NULL: ~1%
--
-- Iteration 14.1: Geocoding Quality Type Fix

-- Change column type to LowCardinality(Nullable(String))
ALTER TABLE financial_reports
MODIFY COLUMN geocoding_quality LowCardinality(Nullable(String))
DEFAULT NULL;

-- Verify the change (optional, for manual validation)
-- SELECT name, type, default_kind, default_expression
-- FROM system.columns
-- WHERE database = currentDatabase()
-- AND table = 'financial_reports'
-- AND name = 'geocoding_quality';
