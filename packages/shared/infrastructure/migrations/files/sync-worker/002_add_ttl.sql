-- Migration: TTL для автоудаления старых данных
-- Description: Добавляет TTL для автоматического удаления устаревших записей
-- Version: 002
-- Author: InfoIndexer Team
-- Date: 2026-04-21
--
-- Success Criteria:
-- - TTL установлен для базовых таблиц
-- - SELECT TTL() FROM system.ttl_tables показывает даты удаления
-- - DELETE ON TTL expired стратегия применяется
--
-- Architecture:
-- - TTL 10 лет для financial_reports (первичные данные)
-- - TTL 5 лет для meta, sanctions (агрегированные данные)
-- - DELETE ON TTL expired: явное удаление вместо RECOMPRESS
--
-- IMPORTANT: MV и View НЕ поддерживают TTL!
-- - financial_reports_summary_mv: MaterializedView — NO TTL
-- - financial_reports_summary: View — NO TTL
-- TTL работает только на базовой таблице financial_reports.
-- При удалении из financial_reports, MV автоматически очистится.

-- TTL для financial_reports (10 лет - первичные данные важнее)
ALTER TABLE financial_reports
  MODIFY TTL updated_at + INTERVAL 10 YEAR;

-- TTL для companies_meta (5 лет - метаданные)
-- Note: уже установлен в shared/001, здесь пропускаем
-- ALTER TABLE companies_meta MODIFY TTL updated_at + INTERVAL 5 YEAR;

-- TTL для company_sanctions (5 лет - санкционные данные)
ALTER TABLE company_sanctions
  MODIFY TTL updated_at + INTERVAL 5 YEAR;

-- TTL для egrul_identity_mapping будет установлен в egrul-sync-worker/005
-- после создания таблицы
