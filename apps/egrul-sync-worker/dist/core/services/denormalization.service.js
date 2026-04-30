"use strict";
/**
 * Сервис для оркестрации денормализации данных EGRUL
 *
 * @remarks
 * Следует SRP: отвечает за координацию процесса денормализации.
 * Делегирует фактические операции Repository.
 *
 * Idempotent: можно вызывать многократно без побочных эффектов.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DenormalizationService = void 0;
/**
 * Сервис для оркестрации денормализации данных EGRUL
 *
 * @remarks
 * Выполняет denormalization отношений компании-директор-владелец
 * для оптимизации JOIN запросов и устранения Memory limit exceeded.
 */
class DenormalizationService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    /**
     * Выполняет полную денормализацию данных
     *
     * @remarks
     * 1. Очищает предыдущие данные (идемпотентность)
     * 2. Подготавливает директоров
     * 3. Подготавливает владельцев
     *
     * Идемпотентен: безопасен для многократного вызова.
     */
    async run() {
        console.log('Starting EGRUL relations denormalization...');
        await this.repository.clear();
        await this.repository.prepareDirectors();
        await this.repository.prepareFounders();
        console.log('EGRUL relations denormalization completed!');
    }
}
exports.DenormalizationService = DenormalizationService;
