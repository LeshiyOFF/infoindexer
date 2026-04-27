-- ═══════════════════════════════════════════════════════════════════
-- Migration 000: Init schema_migrations with category
-- ═══════════════════════════════════════════════════════════════════
--
-- ИСПРАВЛЕНО v6.1: Добавляет category для разрешения collision
--
-- Проблема: sync-worker/005 и egrul-sync-worker/005 конфликтуют
-- Решение: Уникальность по (category, version)
--
-- ПРОИЗВОДСТВЕННАЯ БЕЗОПАСНОСТЬ:
-- - Idempotent: DROP IF EXISTS + CREATE можно перезапускать
-- - Пересоздаёт таблицу с новой структурой
-- - Для dev environment с очищенной volume
--
-- ═══════════════════════════════════════════════════════════════════

DROP TABLE IF EXISTS schema_migrations;

CREATE TABLE schema_migrations (
  category String,
  version String,
  description String,
  applied_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY (category, version);
