-- ═══════════════════════════════════════════════════════════════════
-- Migration 003: Companies Meta Sync Mechanism
-- ═══════════════════════════════════════════════════════════════════
--
-- Проблема: Materialized View обновляется при INSERT в financial_reports,
-- но изменения в companies_meta не захватываются автоматически.
--
-- Решение: Создать таблицу для отслеживания timestamp, которую worker
-- мониторит для триггера инкрементального обновления MV.
--
-- Flow:
-- 1. Worker проверяет companies_meta_sync_state.last_sync_at
-- 2. Находит INNs с updated_at > last_sync_at
-- 3. Re-insert financial_reports для этих INNs → триггер обновления MV
-- 4. Обновляет last_sync_at timestamp
--
-- ═══════════════════════════════════════════════════════════════════

-- Track last sync timestamp для companies_meta
CREATE TABLE IF NOT EXISTS companies_meta_sync_state
ENGINE = MergeTree()
ORDER BY (table_name)
AS SELECT
  'companies_meta' as table_name,
  now() as last_sync_at,
  0 as rows_processed;

-- View показывающий INNs с обновлёнными companies_meta с последнего sync
CREATE OR REPLACE VIEW companies_meta_pending_updates AS
SELECT DISTINCT inn
FROM companies_meta
WHERE updated_at > (
  SELECT last_sync_at
  FROM companies_meta_sync_state
  WHERE table_name = 'companies_meta'
)
LIMIT 100000;
