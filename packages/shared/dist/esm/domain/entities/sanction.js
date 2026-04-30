"use strict";
/**
 * Sanction Aggregate Root
 *
 * Aggregate root для домена Sanctions.
 * Координирует Value Objects и обеспечивает целостность бизнес-логики.
 *
 * @remarks
 * Sanction является корнем aggregate. Все изменения проходят через него.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sanction = void 0;
const result_1 = require("../../result");
const errors_1 = require("../errors");
const value_objects_1 = require("../value-objects");
/**
 * Sanction Aggregate Root
 *
 * Представляет санкцию наложенную на компанию.
 * Является корнем агрегата, координирует Value Objects.
 */
class Sanction {
    id;
    inn;
    program;
    period;
    sourceUrl;
    createdAt;
    updatedAt;
    constructor(id, inn, program, period, sourceUrl, createdAt, updatedAt) {
        this.id = id;
        this.inn = inn;
        this.program = program;
        this.period = period;
        this.sourceUrl = sourceUrl;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    /**
     * Factory method с полной валидацией
     *
     * @returns Result<Sanction, DomainError> — успешное создание или ошибка валидации
     *
     * @example
     * ```ts
     * const result = Sanction.create({
     *   id: '123',
     *   inn: '7727771492',
     *   program: 'EU Sanctions',
     *   ...
     * });
     *
     * result.match({
     *   ok: (sanction) => console.log('Created:', sanction.toDTO()),
     *   err: (error) => console.error('Invalid:', error.toLog())
     * });
     * ```
     */
    static create(data) {
        try {
            return result_1.Result.ok(Sanction.createUnsafe(data));
        }
        catch (error) {
            return result_1.Result.error(error);
        }
    }
    /**
     * Создаёт Sanction без Result wrapper
     * Используется internally когда ошибки уже обработаны
     *
     * @throws DomainError при невалидных данных
     * @internal
     */
    static createUnsafe(data) {
        // Валидация и создание Value Objects
        const authority = value_objects_1.Authority.create(data.authority, data.country);
        const country = value_objects_1.CountryCode.create(data.country);
        const program = value_objects_1.SanctionProgram.create(data.program, data.programId, authority, country);
        const period = value_objects_1.SanctionPeriod.create(new Date(data.startDate), data.endDate ? new Date(data.endDate) : null);
        const url = value_objects_1.SecureUrl.create(data.sourceUrl);
        // Валидация id и inn
        if (!data.id || data.id.trim().length === 0) {
            throw new errors_1.InvalidSanctionProgramError('Sanction ID cannot be empty', {
                id: data.id
            });
        }
        const inn = data.inn.trim();
        if (inn.length === 0) {
            throw new errors_1.InvalidSanctionProgramError('INN cannot be empty', {
                inn: data.inn
            });
        }
        const now = new Date();
        const createdAt = data.createdAt ?? now;
        const updatedAt = data.updatedAt ?? now;
        return new Sanction(data.id.trim(), inn, program, period, url, createdAt, updatedAt);
    }
    /**
     * Проверяет активна ли санкция
     */
    get isActive() {
        return this.period.isActive;
    }
    /**
     * Преобразует в DTO для API response
     */
    toDTO() {
        return {
            id: this.id,
            inn: this.inn,
            program: this.program.name,
            programId: this.program.id,
            authority: this.program.authority.name,
            country: this.program.country.value,
            startDate: this.period.startDate.toISOString(),
            endDate: this.period.endDate?.toISOString() ?? null,
            sourceUrl: this.sourceUrl.value,
            isActive: this.period.isActive
        };
    }
    /**
     * Aggregate identity: две санкции равны если равны их ID
     */
    equals(other) {
        return this.id === other.id;
    }
    /**
     * Создаёт новую санкцию с обновлённым статусом
     * (например, при снятии санкции)
     */
    withEndDate(endDate) {
        try {
            const newPeriod = value_objects_1.SanctionPeriod.create(this.period.startDate, endDate);
            return result_1.Result.ok(new Sanction(this.id, this.inn, this.program, newPeriod, this.sourceUrl, this.createdAt, new Date()));
        }
        catch (error) {
            return result_1.Result.error(error);
        }
    }
}
exports.Sanction = Sanction;
