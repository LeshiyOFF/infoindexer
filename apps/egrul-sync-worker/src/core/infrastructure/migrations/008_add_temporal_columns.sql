-- Migration 008: Add temporal columns to raw tables
-- Purpose: Поддержка инкрементальных обновлений через отслеживание времени появления
-- Architecture: Использует first_seen из FTM как single source of truth
-- DRY: Структура колонок идентична для всех raw таблиц

-- Добавляем временные колонки в таблицу persons
ALTER TABLE egrul_persons_raw
ADD COLUMN IF NOT EXISTS first_seen DateTime DEFAULT now(),
ADD COLUMN IF NOT EXISTS last_changed DateTime DEFAULT now();

-- Добавляем временные колонки в таблицу companies
ALTER TABLE egrul_companies_raw
ADD COLUMN IF NOT EXISTS first_seen DateTime DEFAULT now(),
ADD COLUMN IF NOT EXISTS last_changed DateTime DEFAULT now();

-- Индексы для быстрого поиска по first_seen при инкрементальных обновлениях
-- Note: ClickHouse автоматически создаёт индексы для ORDER BY колонок
-- first_seen используется в WHERE clause для фильтрации новых записей
