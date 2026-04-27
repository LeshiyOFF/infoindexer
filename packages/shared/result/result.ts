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
export class Result<T, E extends Error> {
  private constructor(
    private readonly _value: T,
    private readonly _error: E | null
  ) {}

  /**
   * Создаёт успешный Result
   */
  static ok<T, E extends Error = Error>(value: T): Result<T, E> {
    return new Result<T, E>(value, null);
  }

  /**
   * Создаёт Result с ошибкой
   */
  static error<T, E extends Error = Error>(error: E): Result<T, E> {
    return new Result<T, E>(null as T, error);
  }

  /**
   * Проверяет содержит ли Result успешное значение
   */
  isOk(): boolean {
    return this._error === null;
  }

  /**
   * Проверяет содержит ли Result ошибку
   */
  isErr(): boolean {
    return this._error !== null;
  }

  /**
   * Возвращает успешное значение или выбрасывает ошибку
   *
   * @throws содержащуюся ошибку если Result isErr
   */
  unwrap(): T {
    if (this._error) throw this._error;
    return this._value as T;
  }

  /**
   * Возвращает успешное значение или значение по умолчанию
   */
  unwrapOr(defaultValue: T): T {
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
  map<U>(fn: (value: T) => U): Result<U, E> {
    return this.isOk()
      ? Result.ok(fn(this._value as T))
      : Result.error(this._error as E);
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
  andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return this.isOk()
      ? fn(this._value as T)
      : Result.error(this._error as E);
  }

  /**
   * Async версия andThen
   */
  async andThenAsync<U>(fn: (value: T) => Promise<Result<U, E>>): Promise<Result<U, E>> {
    return this.isOk()
      ? await fn(this._value as T)
      : Result.error(this._error as E);
  }

  /**
   * Async версия map
   */
  async mapAsync<U>(fn: (value: T) => Promise<U>): Promise<Result<U, E>> {
    return this.isOk()
      ? Result.ok(await fn(this._value as T))
      : Result.error(this._error as E);
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
  match<A>(matcher: {
    readonly ok: (value: T) => A;
    readonly err: (error: E) => A;
  }): A {
    return this.isOk() ? matcher.ok(this._value as T) : matcher.err(this._error as E);
  }

  /**
   * Преобразует ошибку в другой тип
   */
  mapError<F extends Error>(fn: (error: E) => F): Result<T, F> {
    return this.isOk()
      ? Result.ok(this._value as T)
      : Result.error(fn(this._error as E));
  }
}
