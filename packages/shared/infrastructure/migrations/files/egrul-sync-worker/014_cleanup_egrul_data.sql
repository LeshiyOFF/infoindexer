-- ═══════════════════════════════════════════════════════════════════
-- Migration 014: Cleanup EGRUL Data for MV Approach
-- ═══════════════════════════════════════════════════════════════════
--
-- Очищаем существующие данные для перехода на Materialized View.
-- Все данные будут загружены заново инкрементально.
--
-- Clean Slate подход: удаляем все EGRUL таблицы и данные.
-- Следующие миграции создадут новую архитектуру на основе Three MV Pattern.
--
-- ═══════════════════════════════════════════════════════════════════

-- Drop существующих View (если есть)
DROP VIEW IF EXISTS v_companies_meta;

-- Drop существующие MV (если были созданы вручную)
DROP TABLE IF EXISTS founders_mv;
DROP TABLE IF EXISTS directors_mv;
DROP TABLE IF EXISTS companies_mv;

-- Drop существующие EGRUL raw таблицы
DROP TABLE IF EXISTS egrul_founders_denormalized;
DROP TABLE IF EXISTS egrul_directors_denormalized;
DROP TABLE IF EXISTS egrul_companies_raw;

-- Drop существующие companies_meta
DROP TABLE IF EXISTS companies_meta;

-- Drop связанные таблицы для чистого slate
DROP TABLE IF EXISTS identity_mapping;
DROP TABLE IF EXISTS company_sanctions;
DROP TABLE IF EXISTS resume_states;

-- Reset sync state (сохраняем таблицу, но очищаем данные)
TRUNCATE TABLE IF EXISTS egrul_sync_state;
DELETE FROM egrul_sync_state WHERE sync_type = 'full';
