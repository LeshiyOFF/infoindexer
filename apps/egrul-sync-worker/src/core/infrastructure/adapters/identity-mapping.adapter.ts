/**
 * Adapter: IdentityMappingService → IIdentityMappingPort
 *
 * @remarks
 * Адаптирует класс IdentityMappingService к порту для использования в зависимостях.
 */

import type { IIdentityMappingPort } from '../../ports/i-identity-mapping.port';
import type { IdentityMappingService } from '../../repositories/identity-mapping.service';

export class IdentityMappingAdapter implements IIdentityMappingPort {
  constructor(private readonly service: IdentityMappingService) {}

  async build(mode?: 'full' | 'incremental'): Promise<{
    personsProcessed: number;
    companiesProcessed: number;
    durationMs: number;
  }> {
    return await this.service.build(mode);
  }
}
