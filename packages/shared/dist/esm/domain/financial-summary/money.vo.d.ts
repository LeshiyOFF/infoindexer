/**
 * Money Value Object
 *
 * @remarks
 * Domain Layer: Представление денежных средств.
 * Part of Clean Architecture / Hexagonal Ports & Adapters.
 *
 * Architecture:
 * - Immutable: все свойства readonly
 * - Validated: create() возвращает Result<T, E>
 * - Self-contained: не зависит от Infrastructure
 *
 * Requirements:
 * - Amount >= 0 (отрицательные суммы запрещены)
 * - Currency: только RUB (расширить позже)
 *
 * @example
 * ```ts
 * const result = Money.create({ amount: 1000, currency: 'RUB' });
 * if (result.isOk()) {
 *   const money = result.unwrap();
 *   console.log(money.isPositive()); // true
 * }
 * ```
 *
 * Iteration 2: Domain Layer (VOs + DTOs)
 */
import { Result } from '../../result';
import type { MoneyData, MoneyDTO } from './financial-summary-data.dto';
import { InvalidMoneyError } from './financial-summary-error';
/**
 * Money Value Object
 *
 * @remarks
 * Представляет денежную сумму в определённой валюте.
 * Immutable: все операции возвращают новый экземпляр.
 */
export declare class Money {
    readonly amount: number;
    readonly currency: string;
    private constructor();
    /**
     * Создаёт Money с валидацией
     *
     * @param data - Данные для создания (amount, currency)
     * @returns Result с Money или InvalidMoneyError
     *
     * @remarks
     * Валидация:
     * - amount >= 0
     * - currency в ALLOWED_CURRENCIES
     */
    static create(data: MoneyData): Result<Money, InvalidMoneyError>;
    /**
     * Проверяет, что сумма равна нулю
     */
    isZero(): boolean;
    /**
     * Проверяет, что сумма положительная
     */
    isPositive(): boolean;
    /**
     * Сравнивает два Money на равенство
     *
     * @param other - Другой экземпляр Money
     * @returns true если amount и currency совпадают
     */
    equals(other: Money): boolean;
    /**
     * Складывает две суммы денег
     *
     * @param other - Другой экземпляр Money
     * @returns Новый экземпляр Money с суммой
     * @throws Error если валюты не совпадают
     *
     * @remarks
     * Возвращает Result для безопасности, но так как оба экземпляра
     * уже валидны, сумма тоже будет валидна (amount >= 0).
     */
    add(other: Money): Result<Money, InvalidMoneyError>;
    /**
     * Умножает сумму на коэффициент
     *
     * @param factor - Коэффициент умножения
     * @returns Новый экземпляр Money с умноженной суммой
     *
     * @remarks
     * Если factor < 0, результат будет 0 (защита от отрицательных сумм).
     */
    multiply(factor: number): Money;
    /**
     * Преобразует в DTO для передачи по API
     */
    toDTO(): MoneyDTO;
    /**
     * Строковое представление
     */
    toString(): string;
}
