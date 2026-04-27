-- Migration 007: Add normalized INN columns
-- Purpose: Pre-computed normalized INN для O(1) JOIN вместо O(N) replaceAll()
-- Architecture: Computed columns с DEFAULT expression
-- Performance: O(1) substring vs O(N) replaceAll (10-100× быстрее)

-- egrul_directorships_raw: organization_id → normalized_org_inn
-- Вычисляется один раз при INSERT, не при каждом SELECT
ALTER TABLE egrul_directorships_raw
ADD COLUMN IF NOT EXISTS normalized_org_inn String
DEFAULT if(
  position(organization_id, 'ru-inn-') = 1,
  substring(organization_id, 8),
  ''
)
COMMENT 'Нормализованный ИНН из organization_id (ru-inn-...)';

-- egrul_ownerships_raw: asset_id → normalized_asset_inn
-- Вычисляется один раз при INSERT, не при каждом SELECT
ALTER TABLE egrul_ownerships_raw
ADD COLUMN IF NOT EXISTS normalized_asset_inn String
DEFAULT if(
  position(asset_id, 'ru-inn-') = 1,
  substring(asset_id, 8),
  ''
)
COMMENT 'Нормализованный ИНН из asset_id (ru-inn-...)';
