-- Migration 010: Add Projections and Skipping Indexes
-- Purpose: Оптимизация запросов к egrul_identity_mapping
--
-- Architecture:
--   1. PROJECTION для автоматической оптимизации фильтрации по entity_type
--   2. SKIPPING INDEX (bloom filter) для IN/NOT IN запросов по id_type
--   3. SKIPPING INDEX (bloom filter) для фильтрации по entity_type
--
-- Best Practices:
--   - Projection автоматически используется query optimizer
--   - Bloom filter оптимизирует IN/NOT IN подзапросы
--   - GRANULARITY 1 для максимальной избирательности
--
-- Источники:
--   - https://clickhouse.com/docs/managing-data/materialized-views-versus-projections
--   - https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/mergetree#skipping-index

-- Projection для фильтрации по entity_type
--
-- SRP: Отвечает только за оптимизацию ORDER BY для запросов с фильтрацией по entity_type
-- DRY: Использует Projection вместо MV (меньше write amplification)
-- OCP: Открыт для расширения (можно добавить другие projection в будущем)
ALTER TABLE egrul_identity_mapping
ADD PROJECTION IF NOT EXISTS pk_by_entity_type
(
    SELECT *
    ORDER BY (entity_type, id_type, raw_id)
);

-- Skipping Index для IN/NOT IN запросов по id_type
--
-- SRP: Отвечает только за оптимизацию запросов с id_type фильтрацией
-- Bloom filter размером 1% (false positive rate)
-- GRANULARITY 1 = максимальная избирательность
ALTER TABLE egrul_identity_mapping
ADD INDEX IF NOT EXISTS idx_id_type_bloom
id_type TYPE bloom_filter(0.01) GRANULARITY 1;

-- Skipping Index для фильтрации по entity_type
--
-- SRP: Отвечает только за оптимизацию запросов с entity_type фильтрацией
-- Работает в паре с projection для дополнительной оптимизации
ALTER TABLE egrul_identity_mapping
ADD INDEX IF NOT EXISTS idx_entity_type_bloom
entity_type TYPE bloom_filter(0.01) GRANULARITY 1;

-- Примечание: Projection и индексы создаются асинхронно
-- ClickHouse начнёт использовать их сразу после применения
-- Для больших таблиц может потребоваться время на первоначальную сборку
