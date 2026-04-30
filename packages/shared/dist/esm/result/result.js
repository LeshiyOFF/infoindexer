/**
 * Result Type — Functional Error Handling
 *
 * Альтернатива исключениям для явной обработки ошибок.
 * Вдохновлено Rust Result, Elm Result, neverthrow.
 *
 * @example
 * ```ts
 * const result = divide(10, 2);  // Result<number, Error>
 *
 * result.match({
 *   ok: (value) => console.log('Result:', value),
 *   err: (error) => console.error('Error:', error.message)
 * });
 * ```
 */
/**
 * Result type для операций которые могут завершиться ошибкой
 *
 * @typeParam T — тип успешного значения
 * @typeParam E — тип ошибки, должен наследовать Error
 */
export class Result {
    _value;
    _error;
    constructor(_value, _error) {
        this._value = _value;
        this._error = _error;
    }
    /**
     * Создаёт успешный Result
     */
    static ok(value) {
        return new Result(value, null);
    }
    /**
     * Создаёт Result с ошибкой
     */
    static error(error) {
        return new Result(null, error);
    }
    /**
     * Проверяет содержит ли Result успешное значение
     */
    isOk() {
        return this._error === null;
    }
    /**
     * Проверяет содержит ли Result ошибку
     */
    isErr() {
        return this._error !== null;
    }
    /**
     * Возвращает успешное значение или выбрасывает ошибку
     *
     * @throws содержащуюся ошибку если Result isErr
     */
    unwrap() {
        if (this._error)
            throw this._error;
        return this._value;
    }
    /**
     * Возвращает успешное значение или значение по умолчанию
     */
    unwrapOr(defaultValue) {
        return this.isOk() ? this._value : defaultValue;
    }
    /**
     * Применяет функцию к успешному значению
     *
     * @example
     * ```ts
     * Result.ok(5).map(x => x * 2)  // Result.ok(10)
     * Result.error(new Error()).map(x => x * 2)  // Result.error(...)
     * ```
     */
    map(fn) {
        return this.isOk()
            ? Result.ok(fn(this._value))
            : Result.error(this._error);
    }
    /**
     * Chain another Result-returning operation
     * Также известен как flatMap, bind
     *
     * @example
     * ```ts
     * parseId(id)
     *   .andThen(id => fetchUser(id))
     *   .andThen(user => validateUser(user))
     * ```
     */
    andThen(fn) {
        return this.isOk()
            ? fn(this._value)
            : Result.error(this._error);
    }
    /**
     * Async версия andThen
     */
    async andThenAsync(fn) {
        return this.isOk()
            ? await fn(this._value)
            : Result.error(this._error);
    }
    /**
     * Async версия map
     */
    async mapAsync(fn) {
        return this.isOk()
            ? Result.ok(await fn(this._value))
            : Result.error(this._error);
    }
    /**
     * Pattern matching — исчерпывающая обработка обоих случаев
     *
     * @example
     * ```ts
     * result.match({
     *   ok: (value) => `Success: ${value}`,
     *   err: (error) => `Error: ${error.message}`
     * })
     * ```
     */
    match(matcher) {
        return this.isOk() ? matcher.ok(this._value) : matcher.err(this._error);
    }
    /**
     * Преобразует ошибку в другой тип
     */
    mapError(fn) {
        return this.isOk()
            ? Result.ok(this._value)
            : Result.error(fn(this._error));
    }
}
