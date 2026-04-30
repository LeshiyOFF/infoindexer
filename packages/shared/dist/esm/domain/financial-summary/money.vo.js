"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Money = void 0;
const result_1 = require("../../result");
const financial_summary_error_1 = require("./financial-summary-error");
/**
 * Поддерживаемые валюты
 *
 * @remarks
 * Расширить в будущем для поддержки других валют.
 */
const ALLOWED_CURRENCIES = new Set(['RUB']);
/**
 * Money Value Object
 *
 * @remarks
 * Представляет денежную сумму в определённой валюте.
 * Immutable: все операции возвращают новый экземпляр.
 */
class Money {
    amount;
    currency;
    constructor(amount, currency) {
        this.amount = amount;
        this.currency = currency;
    }
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
    static create(data) {
        const { amount, currency } = data;
        // Валидация amount
        if (typeof amount !== 'number' || isNaN(amount)) {
            return result_1.Result.error(new financial_summary_error_1.InvalidMoneyError(amount ?? 0, currency ?? 'RUB', 'missing_field'));
        }
        if (amount < 0) {
            return result_1.Result.error(new financial_summary_error_1.InvalidMoneyError(amount, currency, 'negative_amount'));
        }
        // Валидация currency
        const normalizedCurrency = (currency ?? 'RUB').toUpperCase().trim();
        if (!ALLOWED_CURRENCIES.has(normalizedCurrency)) {
            return result_1.Result.error(new financial_summary_error_1.InvalidMoneyError(amount, currency, 'invalid_currency'));
        }
        return result_1.Result.ok(new Money(amount, normalizedCurrency));
    }
    /**
     * Проверяет, что сумма равна нулю
     */
    isZero() {
        return this.amount === 0;
    }
    /**
     * Проверяет, что сумма положительная
     */
    isPositive() {
        return this.amount > 0;
    }
    /**
     * Сравнивает два Money на равенство
     *
     * @param other - Другой экземпляр Money
     * @returns true если amount и currency совпадают
     */
    equals(other) {
        return this.amount === other.amount && this.currency === other.currency;
    }
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
    add(other) {
        if (this.currency !== other.currency) {
            return result_1.Result.error(new financial_summary_error_1.InvalidMoneyError(this.amount, `${this.currency}/${other.currency}`, 'invalid_currency'));
        }
        return Money.create({
            amount: this.amount + other.amount,
            currency: this.currency
        });
    }
    /**
     * Умножает сумму на коэффициент
     *
     * @param factor - Коэффициент умножения
     * @returns Новый экземпляр Money с умноженной суммой
     *
     * @remarks
     * Если factor < 0, результат будет 0 (защита от отрицательных сумм).
     */
    multiply(factor) {
        const result = Math.max(0, this.amount * factor);
        return new Money(result, this.currency);
    }
    /**
     * Преобразует в DTO для передачи по API
     */
    toDTO() {
        return {
            amount: this.amount,
            currency: this.currency
        };
    }
    /**
     * Строковое представление
     */
    toString() {
        return `${this.amount} ${this.currency}`;
    }
}
exports.Money = Money;
