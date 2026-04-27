/**
 * Sanction Aggregate Root
 *
 * Aggregate root для домена Sanctions.
 * Координирует Value Objects и обеспечивает целостность бизнес-логики.
 *
 * @remarks
 * Sanction является корнем aggregate. Все изменения проходят через него.
 */
import { Result } from '../../result';
import { DomainError } from '../errors';
import { SanctionProgram, SanctionPeriod, SecureUrl } from '../value-objects';
import { SanctionData, SanctionDTO } from './sanction-types';
/**
 * Sanction Aggregate Root
 *
 * Представляет санкцию наложенную на компанию.
 * Является корнем агрегата, координирует Value Objects.
 */
export declare class Sanction {
    readonly id: string;
    readonly inn: string;
    readonly program: SanctionProgram;
    readonly period: SanctionPeriod;
    readonly sourceUrl: SecureUrl;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    private constructor();
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
    static create(data: SanctionData): Result<Sanction, DomainError>;
    /**
     * Создаёт Sanction без Result wrapper
     * Используется internally когда ошибки уже обработаны
     *
     * @throws DomainError при невалидных данных
     * @internal
     */
    static createUnsafe(data: SanctionData): Sanction;
    /**
     * Проверяет активна ли санкция
     */
    get isActive(): boolean;
    /**
     * Преобразует в DTO для API response
     */
    toDTO(): SanctionDTO;
    /**
     * Aggregate identity: две санкции равны если равны их ID
     */
    equals(other: Sanction): boolean;
    /**
     * Создаёт новую санкцию с обновлённым статусом
     * (например, при снятии санкции)
     */
    withEndDate(endDate: Date): Result<Sanction, DomainError>;
}
