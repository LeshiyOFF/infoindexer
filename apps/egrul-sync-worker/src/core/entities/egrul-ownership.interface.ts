/**
 * EGRUL Ownership Row для записи в ClickHouse
 */
export interface EgrulOwnershipRow {
  id: string;
  owner_id: string;
  asset_id: string;
  percentage: string;
  shares_count: string;
  start_date: string;
  end_date: string | null;
}
