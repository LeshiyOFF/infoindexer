/**
 * SanctionList Value Object
 *
 * SanctionList — Value Object для списка санкций
 * Используется для операций над множеством санкций
 */
import { Result } from '../../result';
import { InvalidSanctionProgramError } from '../errors';
/**
 * SanctionList — Value Object для списка санкций
 *
 * Используется для операций над множеством санкций
 */
export class SanctionList {
    sanctions;
    constructor(sanctions) {
        this.sanctions = sanctions;
    }
    /**
     * Создаёт список из массива Sanction
     * Проверяет уникальность ID
     */
    static create(sanctions) {
        const ids = new Set();
        const duplicates = [];
        for (const sanction of sanctions) {
            if (ids.has(sanction.id)) {
                duplicates.push(sanction.id);
            }
            ids.add(sanction.id);
        }
        if (duplicates.length > 0) {
            return Result.error(new InvalidSanctionProgramError('Duplicate sanction IDs', { duplicates }));
        }
        return Result.ok(new SanctionList(sanctions));
    }
    /**
     * Создаёт список без валидации (internal use)
     */
    static createUnsafe(sanctions) {
        return new SanctionList(sanctions);
    }
    /**
     * Фильтрует активные санкции
     */
    get active() {
        return this.sanctions.filter(s => s.isActive);
    }
    /**
     * Фильтрует снятые санкции
     */
    get lifted() {
        return this.sanctions.filter(s => !s.isActive);
    }
    /**
     * Список всех санкций
     */
    get all() {
        return this.sanctions;
    }
    /**
     * Количество санкций
     */
    get size() {
        return this.sanctions.length;
    }
    /**
     * Преобразует все санкции в DTO
     */
    toDTO() {
        return this.sanctions.map(s => s.toDTO());
    }
    /**
     * Находит санкцию по ID
     */
    findById(id) {
        return this.sanctions.find(s => s.id === id) ?? null;
    }
    /**
     * Фильтрует санкции по ИНН
     */
    findByInn(inn) {
        return this.sanctions.filter(s => s.inn === inn);
    }
    /**
     * Группирует санкции по стране
     */
    groupByCountry() {
        const result = {};
        for (const sanction of this.sanctions) {
            const country = sanction.program.country.value;
            if (!result[country]) {
                result[country] = [];
            }
            result[country].push(sanction);
        }
        return result;
    }
}
