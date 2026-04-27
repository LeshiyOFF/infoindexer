"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationByIdService = void 0;
/**
 * Service для получения организации по ID
 *
 * @remarks
 * Реализует бизнес-логику для работы с отдельной организацией.
 * Использует IOrganizationById порт через Dependency Inversion.
 */
class OrganizationByIdService {
    organizationById;
    constructor(organizationById) {
        this.organizationById = organizationById;
    }
    /**
     * Получает финансовую сводку организации по ИНН
     *
     * @param inn - ИНН организации
     * @returns FinancialSummary или null если не найдена
     */
    async getFinancialSummary(inn) {
        const result = await this.organizationById.findById(inn);
        return result.summary ?? null;
    }
}
exports.OrganizationByIdService = OrganizationByIdService;
