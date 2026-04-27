/**
 * EGRUL Directorship Row для записи в ClickHouse
 */
export interface EgrulDirectorshipRow {
    id: string;
    organization_id: string;
    director_id: string;
    role: string;
    start_date: string;
    end_date: string | null;
}
