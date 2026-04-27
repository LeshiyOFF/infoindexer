/**
 * Репозиторий для работы с unmapped INN
 *
 * @remarks
 * Следует SRP: отвечает только за получение INN без entity mapping.
 * Использует SQL нормализацию для производительности.
 */
import type { ClickHouseClient } from '@clickhouse/client';
/**
 * Репозиторий для работы с unmapped INN
 */
export declare class UnmappedInnsRepository {
    private readonly clickhouse;
    constructor(clickhouse: ClickHouseClient);
    /**
     * Получает список INN без entity mapping
     *
     * @remarks
     * Использует SQL нормализацию (position + substring) вместо replaceAll().
     * Это в 10-100× быстрее на больших объёмах данных.
     *
     * @param limit - Максимальное количество INN для возврата
     * @returns Массив INN
     */
    fetchUnmappedInns(limit: number): Promise<string[]>;
}
