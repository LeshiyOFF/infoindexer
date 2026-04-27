-- Migration: TTL для автоудаления старых данных
-- Description: Добавляет TTL для автоматического удаления устаревших записей
-- Version: 002
-- Author: InfoIndexer Team
-- Date: 2026-04-21
--
-- Success Criteria:
-- - TTL установлен для всех таблиц
-- - SELECT TTL() FROM system.ttl_tables показывает даты удаления
-- - DELETE ON TTL expired стратегия применяется
--
-- Architecture:
-- - TTL 10 лет для financial_reports (первичные данные)
-- - TTL 5 лет для агрегированных данных (summary, meta, sanctions)
-- - DELETE ON TTL expired: явное удаление вместо RECOMPRESS
--
-- Note: updated_at + INTERVAL корректный синтаксис ClickHouse TTL

-- TTL для financial_reports (10 лет - первичные данные важнее)
ALTER TABLE financial_reportsMODIFY TTL updated_at + INTERVAL 10 YEAR
;

-- TTL для financial_reports_summary (5 лет - агрегированные данные)
ALTER TABLE financial_reports_summaryMODIFY TTL updated_at + INTERVAL 5 YEAR
;

-- TTL для companies_meta (5 лет - метаданные)
ALTER TABLE companies_metaMODIFY TTL updated_at + INTERVAL 5 YEAR
;

-- TTL для company_sanctions (5 лет - санкционные данные)
ALTER TABLE company_sanctionsMODIFY TTL updated_at + INTERVAL 5 YEAR
;

-- TTL для egrul_identity_mapping (5 лет - identity mapping)
ALTER TABLE egrul_identity_mappingMODIFY TTL updated_at + INTERVAL 5 YEAR
;
