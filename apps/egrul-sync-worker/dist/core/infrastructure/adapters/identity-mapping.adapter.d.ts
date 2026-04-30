/**
 * Adapter: IdentityMappingService → IIdentityMappingPort
 *
 * @remarks
 * Адаптирует класс IdentityMappingService к порту для использования в зависимостях.
 */
import type { IIdentityMappingPort } from '../../ports/i-identity-mapping.port';
import type { IdentityMappingService } from '../../repositories/identity-mapping.service';
export declare class IdentityMappingAdapter implements IIdentityMappingPort {
    private readonly service;
    constructor(service: IdentityMappingService);
    build(mode?: 'full' | 'incremental'): Promise<{
        personsProcessed: number;
        companiesProcessed: number;
        durationMs: number;
    }>;
}
