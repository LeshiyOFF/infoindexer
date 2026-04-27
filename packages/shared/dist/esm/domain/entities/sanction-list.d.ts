/**
 * SanctionList Value Object
 *
 * SanctionList — Value Object для списка санкций
 * Используется для операций над множеством санкций
 */
import { Result } from '../../result';
import { DomainError } from '../errors';
import { Sanction } from './sanction';
import type { SanctionDTO } from './sanction-types';
/**
 * SanctionList — Value Object для списка санкций
 *
 * Используется для операций над множеством санкций
 */
export declare class SanctionList {
    private readonly sanctions;
    private constructor();
    /**
     * Создаёт список из массива Sanction
     * Проверяет уникальность ID
     */
    static create(sanctions: readonly Sanction[]): Result<SanctionList, DomainError>;
    /**
     * Создаёт список без валидации (internal use)
     */
    static createUnsafe(sanctions: readonly Sanction[]): SanctionList;
    /**
     * Фильтрует активные санкции
     */
    get active(): readonly Sanction[];
    /**
     * Фильтрует снятые санкции
     */
    get lifted(): readonly Sanction[];
    /**
     * Список всех санкций
     */
    get all(): readonly Sanction[];
    /**
     * Количество санкций
     */
    get size(): number;
    /**
     * Преобразует все санкции в DTO
     */
    toDTO(): readonly SanctionDTO[];
    /**
     * Находит санкцию по ID
     */
    findById(id: string): Sanction | null;
    /**
     * Фильтрует санкции по ИНН
     */
    findByInn(inn: string): readonly Sanction[];
    /**
     * Группирует санкции по стране
     */
    groupByCountry(): Readonly<Record<string, readonly Sanction[]>>;
}
