-- Migration 009: Create sync state table for incremental updates
-- Purpose: Хранение состояния синхронизации для инкрементальных обновлений
-- Architecture: ReplacingMergeTree для автоматической дедупликации записей
-- DRY: Единая таблица для всех типов синхронизации

CREATE TABLE IF NOT EXISTS egrul_sync_state (
    -- Тип синхронизации (например, 'identity_mapping', 'sanctions')
    sync_type String,

    -- Временная метка последней синхронизации
    last_sync_at DateTime,

    -- Количество обработанных записей (для метрик)
    records_processed UInt64,

    -- Длительность синхронизации в миллисекундах (для метрик)
    duration_ms UInt32,

    -- Временная метка обновления записи
    updated_at DateTime DEFAULT now()
) ENGINE = ReplacingMergeTree(updated_at)
ORDER BY sync_type
SETTINGS index_granularity = 8192;
