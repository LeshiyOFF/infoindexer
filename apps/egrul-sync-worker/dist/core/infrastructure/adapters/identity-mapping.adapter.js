"use strict";
/**
 * Adapter: IdentityMappingService → IIdentityMappingPort
 *
 * @remarks
 * Адаптирует класс IdentityMappingService к порту для использования в зависимостях.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityMappingAdapter = void 0;
class IdentityMappingAdapter {
    service;
    constructor(service) {
        this.service = service;
    }
    async build(mode) {
        return await this.service.build(mode);
    }
}
exports.IdentityMappingAdapter = IdentityMappingAdapter;
