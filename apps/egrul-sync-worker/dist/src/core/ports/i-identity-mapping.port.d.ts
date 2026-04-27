/**
 * Port: Identity Mapping
 *
 * @remarks
 * Содержит только публичные методы IdentityMappingService для использования в зависимостях.
 */
export interface IIdentityMappingPort {
    /**
     * Строит identity mapping
     *
     * @param mode - Режим построения ('full' или 'incremental')
     */
    build(mode?: 'full' | 'incremental'): Promise<{
        personsProcessed: number;
        companiesProcessed: number;
        durationMs: number;
    }>;
}
