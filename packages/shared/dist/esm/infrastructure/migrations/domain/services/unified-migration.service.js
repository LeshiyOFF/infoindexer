"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnifiedMigrationService = void 0;
/**
 * Unified Migration Service (Orchestrator)
 *
 * @remarks
 * v2.1: Переписан как координатор.
 * Делегирует обнаружение и применение специализированным сервисам.
 *
 * Изменения:
 * - Убрана прямая зависимость от IMigrationRunner
 * - Убрана логика обнаружения (делегирует Discoverer)
 * - Убрана логика применения (делегирует Applier)
 * - Зависимости через Ports (DIP compliance)
 */
class UnifiedMigrationService {
    discoverer;
    applier;
    constructor(params) {
        this.discoverer = params.discoverer;
        this.applier = params.applier;
    }
    /**
     * Применяет все миграции
     *
     * @returns Статистика выполнения
     * @throws {Error} если какая-либо миграция не применяется
     *
     * @remarks
     * Делегирует работу:
     * 1. Discoverer → обнаруживает миграции
     * 2. Applier → применяет миграции
     */
    async applyAll() {
        const descriptors = this.discoverer.discover();
        return this.applier.applyAll(descriptors);
    }
    /**
     * Получает список всех дескрипторов миграций
     *
     * @returns Readonly массив дескрипторов
     *
     * @remarks
     * Делегирует работу Discoverer.
     */
    getDescriptors() {
        return this.discoverer.discover();
    }
}
exports.UnifiedMigrationService = UnifiedMigrationService;
